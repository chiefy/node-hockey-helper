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
 - NodeJS
 - Java
 - VLC (and VLC /r/hockey lua script)
 - FuckNeulionV2.jar (please don't ask where to get it)

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
$ hockey-helper
```
## OS Support
Currently the following are supported:
 - OSX
 - Linux

I have plans on making it work for Windows, but haven't had the opportunity to test it yet, so stay tuned!

## Feedback / Questions / Support
@todo put a link to a /r/nhlstreams thread about this here 