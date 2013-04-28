# ShareIt! - Pure Javascript Peer to Peer filesharing

Jesús Leganés Combarro "Piranna" - [piranna@gmail.com]

Based on code from Rich Jones - rich@[gun.io](http://gun.io)

ShareIt! is a "Peer to Peer" filesharing system written in pure Javascript and
based on the [DirtyShare](https://github.com/Miserlou/DirtyShare)
proof-of-concept by Rich Jones.

This project is also candidate for the [Universitary Free Software Championship]
(http://www.concursosoftwarelibre.org/1213).

If you will fork the project (and more if you want to do modifications) please
send me an email just to let me know :-)

## About

File transfers in ShareIt! is build over WebRTC PeerConnection [DataChannels]
(http://dev.w3.org/2011/webrtc/editor/webrtc.html#rtcdatachannel) so they could
be transfered directly between peers, but since currently they are not available
natively it's being used a [DataChannel polyfill]
(https://github.com/piranna/DataChannel-polyfill). This makes it perfect for
anonymity.

Let's make a purely browser based, ad-free, Free and Open Source private and
anonymous distributed filesharing system!

## Mailing List

If you'd like to discuss P2P web applications further, send an email to 

> webp2p@librelist.com

and you'll be part of the discussion mailing list! ([Archives here]
(http://librelist.com/browser/webp2p/)).

[Development blog](http://pirannafs.blogspot.com.es)

## How to test it

The webapp is designed to be fully client side, so files can be served by any
static web server or web hosting. If you have Python installed they can be
served directly from the project folder using

> python -m SimpleHTTPServer 8000

so the webapp will be available on [localhost:8000](http://localhost:8000). You
can also host it on [DropBox](https://www.dropbox.com/help/201/en) if desired.
It is currently publicly hosted on

* [5Apps]  (https://5apps.com/demos/piranna/shareit)
* [DropBox](https://dl-web.dropbox.com/spa/je1wmwnmw0lbae2/ShareIt!/index.html)
* [GitHub] (http://piranna.github.com/ShareIt)

The peer connections are managed by an external handshake channel. Currently is
being used primarily [PubNub](http://www.pubnub.com) and [SimpleSignaling]
(https://github.com/piranna/SimpleSignaling) using a test server hosted on
Nodejitsu, but it's being researched to use some more standard and distributed
handshake protocols in an anonymous way so this single-point-of-failure could
be dropped.

Regarding to the browser, it's recomended to use a high edge one. Test are being
done on Chromium v24 at this moment and currently it's the only officially
supported (news about it being used sucesfully on other browser are greatly
accepted!!! :-D ). You can test it locally opening two browser tabs, but it
should work also if used between several machines (it was succesfully tested
to transfer files through the wild Internet from Finland to Spain... :-) ).

## External libraries
### UI

* [jQuery]          (http://jquery.com)
* [jQuery UI]       (http://jqueryui.com)
* [jQuery TreeTable](http://ludo.cubicphuse.nl/jquery-plugins/treeTable/doc)
* [Humanize]        (https://github.com/taijinlee/humanize)

### Handshake

* [SimpleSignaling](https://github.com/piranna/SimpleSignaling)
* [PubNub]         (http://www.pubnub.com)

### Random utilities

* [BoolArray.js]        (https://github.com/piranna/BoolArray.js)
* [DataChannel-polyfill](https://github.com/piranna/DataChannel-polyfill)
* [EventTarget.js]      (https://github.com/piranna/EventTarget.js)
* [jsSHA]               (https://github.com/Caligatio/jsSHA)

## Some related projects

* [WebRTC.io] (https://github.com/webRTC/webRTC.io)
* [bonevalue] (https://github.com/theninj4/bonevalue)
* [QuickShare](https://github.com/orefalo/QuickShare)
* [ShareFest] (https://github.com/Peer5/ShareFest)

## Derivated projects

* [WhatAreYouDownloading](http://whatareyoudownloading.com)
* [Ampere]               (http://hcliff.github.com/ampere)

## License

All this code is under the Affero GNU General Public License for non-profit,
personal and/or academic purposses, and I will thank you if you send me an email
to tell me your story and add some references to this project if this is your
case. Regarding to other cases, I would be able to give you a commercial
license, please contact me to talk about it.

The WebP2P protocol library (located at js/webp2p) and the ShareIt! app core
(located at js/shareit-core) will be distributed as independent libraries
some date in the future, and I am willing to relicense them under
the BSD/MIT/Apache license if requested, I simply ask that you email me and tell
me why. I'll almost certainly agree.

Patches graciously accepted!