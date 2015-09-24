# -*- coding: utf-8 -*-

# Changelog:
#   [2008-03-14] Initial version with support for Ogg Vorbis, FLAC and MP3

PLUGIN_NAME = u"Moodbars"
PLUGIN_AUTHOR = u"Len Joubert"
PLUGIN_DESCRIPTION = """Calculate Moodbars for selected files and albums."""
PLUGIN_VERSION = "0.1"
PLUGIN_API_VERSIONS = ["0.10", "0.15", "0.16"]

import os.path
from collections import defaultdict
from subprocess import check_call
from picard.album import Album, NatAlbum
from picard.track import Track
from picard.file import File
from picard.util import encode_filename, decode_filename, partial, thread
from picard.ui.options import register_options_page, OptionsPage
from picard.config import TextOption
from picard.ui.itemviews import (BaseAction, register_file_action,
                                 register_album_action)
from picard.plugins.replaygain.ui_options_replaygain import Ui_ReplayGainOptionsPage

# Path to various replay gain tools. There must be a tool for every supported
# audio file format.
REPLAYGAIN_COMMANDS = {
    "Ogg Vorbis": ("replaygain_vorbisgain_command", "replaygain_vorbisgain_options"),
    "MPEG-1 Audio": ("replaygain_mp3gain_command", "replaygain_mp3gain_options"),
    "FLAC": ("replaygain_metaflac_command", "replaygain_metaflac_options"),
    "WavPack": ("replaygain_wvgain_command", "replaygain_wvgain_options"),
}


def calculate_replay_gain_for_files(files, format, tagger):
    """Generate the moodfiles for a list of files in album mode."""
    file_list = ['%s' % encode_filename(f.filename) for f in files]
    # for mood_file in file_list:
    #     (prefix, sep, suffix) = mood_file.rpartition('.')
    #     new_filename = prefix + '.mood'
    #     file_list_mood = ['%s' % new_filename]
    """ Try something different, copy one list to other and try os.path.splitext method"""
    for mood_file in file_list:
        new_filename = os.path.join(os.path.dirname(
            mood_file), '.' + os.path.splitext(os.path.basename(mood_file))[0] + '.mood')
        file_list_mood = ['%s' % new_filename]

    if format in REPLAYGAIN_COMMANDS \
            and tagger.config.setting[REPLAYGAIN_COMMANDS[format][0]]:
        command = tagger.config.setting[REPLAYGAIN_COMMANDS[format][0]]
        options = tagger.config.setting[
            REPLAYGAIN_COMMANDS[format][1]].split(' ')
#        tagger.log.debug('My debug >>>  %s' % (file_list_mood))
        tagger.log.debug(
            '%s %s %s %s' % (command, decode_filename(' '.join(file_list)), ' '.join(options), decode_filename(' '.join(file_list_mood))))
        check_call([command] + file_list + options + file_list_mood)
    else:
        raise Exception('Moodbar: Unsupported format %s' % (format))


class ReplayGain(BaseAction):
    NAME = N_("Calculate Moodbar for &file...")

    def _add_file_to_queue(self, file):
        thread.run_task(
            partial(self._calculate_replaygain, file),
            partial(self._replaygain_callback, file))

    def callback(self, objs):
        for obj in objs:
            if isinstance(obj, Track):
                for file_ in obj.linked_files:
                    self._add_file_to_queue(file_)
            elif isinstance(obj, File):
                self._add_file_to_queue(obj)

    def _calculate_replaygain(self, file):
        self.tagger.window.set_statusbar_message(
            N_('Calculating moodbar for "%(filename)s"...'),
            {'filename': file.filename}
        )
        calculate_replay_gain_for_files([file], file.NAME, self.tagger)

    def _replaygain_callback(self, file, result=None, error=None):
        if not error:
            self.tagger.window.set_statusbar_message(
                N_('Moodbar for "%(filename)s" successfully calculated.'),
                {'filename': file.filename}
            )
        else:
            self.tagger.window.set_statusbar_message(
                N_('Could not calculate moodbar for "%(filename)s".'),
                {'filename': file.filename}
            )


class AlbumGain(BaseAction):
    NAME = N_("Calculate Moodbars for &album...")

    def callback(self, objs):
        albums = filter(lambda o: isinstance(o, Album) and not isinstance(o,
                                                                          NatAlbum), objs)
        nats = filter(lambda o: isinstance(o, NatAlbum), objs)

        for album in albums:
            thread.run_task(
                partial(self._calculate_albumgain, album),
                partial(self._albumgain_callback, album))

        for natalbum in nats:
            thread.run_task(
                partial(self._calculate_natgain, natalbum),
                partial(self._albumgain_callback, natalbum))

    def split_files_by_type(self, files):
        """Split the given files by filetype into separate lists."""
        files_by_format = defaultdict(list)

        for file in files:
            files_by_format[file.NAME].append(file)

        return files_by_format

    def _calculate_albumgain(self, album):
        self.tagger.window.set_statusbar_message(
            N_('Calculating moodbars for "%(album)s"...'),
            {'album': album.metadata["album"]}
        )
        filelist = [t.linked_files[0] for t in album.tracks if t.is_linked()]

        for format, files in self.split_files_by_type(filelist).iteritems():
            calculate_replay_gain_for_files(files, format, self.tagger)

    def _calculate_natgain(self, natalbum):
        """Calculates the replaygain"""
        self.tagger.window.set_statusbar_message(
            N_('Calculating moodbars for "%(album)s"...'),
            {'album': natalbum.metadata["album"]}
        )
        filelist = [t.linked_files[0]
                    for t in natalbum.tracks if t.is_linked()]

        for file_ in filelist:
            calculate_replay_gain_for_files([file_], file_.NAME, self.tagger)

    def _albumgain_callback(self, album, result=None, error=None):
        if not error:
            self.tagger.window.set_statusbar_message(
                N_('Moodbars for "%(album)s" successfully calculated.'),
                {'album': album.metadata["album"]}
            )
        else:
            self.tagger.window.set_statusbar_message(
                N_('Could not calculate moodbars for "%(album)s".'),
                {'album': album.metadata["album"]}
            )


class ReplayGainOptionsPage(OptionsPage):

    NAME = "Moodbars"
    TITLE = "Moodbars"
    PARENT = "plugins"

    options = [
        TextOption("setting", "replaygain_vorbisgain_command", "moodbar"),
        TextOption("setting", "replaygain_vorbisgain_options", "-o"),
        TextOption("setting", "replaygain_mp3gain_command", "moodbar"),
        TextOption("setting", "replaygain_mp3gain_options", "-o"),
        TextOption("setting", "replaygain_metaflac_command", "moodbar"),
        TextOption("setting", "replaygain_metaflac_options", "-o"),
        TextOption("setting", "replaygain_wvgain_command", "moodbar"),
        TextOption("setting", "replaygain_wvgain_options", "-o")
    ]

    def __init__(self, parent=None):
        super(ReplayGainOptionsPage, self).__init__(parent)
        self.ui = Ui_ReplayGainOptionsPage()
        self.ui.setupUi(self)

    def load(self):
        self.ui.vorbisgain_command.setText(
            self.config.setting["replaygain_vorbisgain_command"])
        self.ui.mp3gain_command.setText(
            self.config.setting["replaygain_mp3gain_command"])
        self.ui.metaflac_command.setText(
            self.config.setting["replaygain_metaflac_command"])
        self.ui.wvgain_command.setText(
            self.config.setting["replaygain_wvgain_command"])

    def save(self):
        self.config.setting["replaygain_vorbisgain_command"] = unicode(
            self.ui.vorbisgain_command.text())
        self.config.setting["replaygain_mp3gain_command"] = unicode(
            self.ui.mp3gain_command.text())
        self.config.setting["replaygain_metaflac_command"] = unicode(
            self.ui.metaflac_command.text())
        self.config.setting["replaygain_wvgain_command"] = unicode(
            self.ui.wvgain_command.text())

register_file_action(ReplayGain())
register_album_action(AlbumGain())
register_options_page(ReplayGainOptionsPage)
