# Hockey Helper
This is a NodeJS command line program that helps interface with `FuckNeulionV2.jar`

## tl;dr 
Install:
```
$ npm install -g hockey-helper
```
Usage:
```
$ hockey-helper <path-to-fuckneulionv2.jar>
```
Wait for `"HOUSTON, WE HAVE LIFTOFF!"` Start VLC, pick home/away stream from game you just selected.

## Pre-reqs
 - [NodeJS](http://nodejs.org)
 - Java
 - [VLC](http://www.videolan.org/vlc/) (and VLC [/r/hockey lua script](https://raw.githubusercontent.com/InfernoZeus/rhockey-vlc/no-time-mod/hockey.luac))
 - [FuckNeulionV2.jar](https://www.reddit.com/r/NHLStreams/comments/2izhk1/the_vlc_fix/)

## Installation
First off, make sure you have installed NodeJS and Java properly. You can test this by issuing the following commands in a command prompt:
```
$ java -version && node --version
```
The output should look something like
```
java version "1.6.0_65"
Java(TM) SE Runtime Environment (build 1.6.0_65-b14-462-11M4609)
Java HotSpot(TM) 64-Bit Server VM (build 20.65-b04-462, mixed mode)
v0.10.35
```

After you have done that, install hockey-helper via npm:
```
$ npm install -g hockey-helper
```

## Usage
After you install the module, you should be able to 
```
$ hockey-helper <path-to-fuckneulionv2.jar>
```

## OS Support
Currently the following are supported:
 - OSX
 - Linux

I have plans on making it work for Windows, but haven't had the opportunity to test it yet, so stay tuned!

## Feedback / Questions / Support
For support, please check [the /r/NHLstreams thread.](https://www.reddit.com/r/NHLStreams/comments/2u5ni7/nodehockeyhelper_another_fnv2_helper_script/)

Please report bugs [in github issues tracker](https://github.com/chiefy/node-hockey-helper/issues)