## Body Camera Client/Server

### Summary

The "Body Camera Client/Server" ("BodyCamera") is intended as a starting point for an Android, iOS, or ARM based Linux or Windows IoT device (i.e."Client") based body camera that stores video and audio recordings ("Recordings") locally on the Client and also uploads the Recordings to a remote server ("Server") as soon as a WiFi or cellular connection is available.

For example, an organization may wish to provide selected personnel (e.g. cashiers and security officers) with proprietary body cameras that continuously send Recordings to a company managed Server that can be archived and viewed on-demand.

BodyCamera software can also be used as the starting point for a fixed camera based that uses an Android phone, Android tablet, iOS phone, iOS tablet, or ARM based Linux or Windows IoT device.

### Client Option 1: Android Cell Phone

[Termux v1.18](https://github.com/termux/termux-app/releases/download/v0.118.0/termux-app_v0.118.0+github-debug_arm64-v8a.apk) was downloaded and [side-loaded](https://www.makeuseof.com/tag/how-to-manually-install-side-load-apps-on-your-android-device/) on a 5G cell phone (TCL 10 5G UW on the Verizon network) running Android version 10 (kernel version 4.19.81-perf+). See also [wiki.termux](https://wiki.termux.com/wiki/Main_Page).

Termux provides a Linux instance which supports NodeJS v18.7.0 and NPM 8.15.0, which was used to build the localhost webserver on the Client.

The [Android Opera Browser App](https://play.google.com/store/apps/details?id=com.opera.browser&hl=en_US&gl=US) provides access to the JavaScript APIs for [audio/video](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Client-side_web_APIs/Video_and_audio_APIs) and [geolocation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API).

Websockets are used for fast bi-directional communications between the Termux and the Opera browser Client functions, and also between Termux and the Server.

The default configuration creates Recordings that are webm files of about 10 seconds duration and 3MB size containing 480x640 VP8 video and 48,000 sample/second Opus audio. When using a cell phone connection (e.g. 4G or 5G), the upload data rate needed to upload each new file before the next file is created is about 3 Mbps.

### Client Option 2: ARM IoT Device

The use of NodeJS for Client functions allows for an inexpensive ARM based IoT device with a camera, microphone, GPS, and other peripherals as desired.

NodeJS is supported on many ARM operating systms, including Linux and Windows.

### Demonstration Server: Ubuntu 22.04 LTS

Ubuntu 22.04 LTS supports NodeJS v12.22.12 and NPM 6.14.16, which was used to build the demonstration secure websockets server.

For demonstration, [SSH and SFTP with a keyfile and password](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server), [UFW firewall](https://wiki.ubuntu.com/UncomplicatedFirewall), [PM2 process manager](https://pm2.keymetrics.io/docs/usage/quick-start/), and [LetsEncrypt SSL certificates](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04) for Secure Websockets were used.

If desired, a secure HTTPS webserver can be added with [NGINX reverse proxy webserver](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/).

### Recommended Experience Level

The BodyCamera software and information is provided as a starting point for experienced development engineers familiar with audio, video, Android, Linux, NodeJS, JavaScript, and secure webservers, and is NOT written as a tutorial.

### Software License

Copyright 2022 Toqana Consulting, LLC (A Nevada Limited Liability Company)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE, INCLUDING, BUT NOT LIMITED TO, THE ETHICAL AND LAWFUL USE OF AUDIO AND VIDEO RECORDING.

### Demonstrations, Software Support and Custom Applications

This software is provided without any promise of support.

Based upon the nature of the requested support and available resources, support may be available at no charge or fee based.

Please email demonstration, support, or custom application requests to <BodyCamera@OTTStreamingVideo.net>.

### Custom Application Possibilities

1. Add voice commands or audio classification (e.g. [AudioClassify.com](https://AudioClassify.com)).

2. Add video face recognition, object recognition, or motion detection with [TensorFlow](https://www.tensorflow.org/lite/api_docs/cc) and/or [OpenCV](https://opencv.org/opencv-face-recognition/).

3. Create Android .apk ([Kotelin](https://kotlinlang.org) is recommended).

4. Create iOS app.

5. Create ARM based IoT product.

6. Create C++ compiled app.

7. Transmit real-time streaming audio and video rather than discreet audio/video files.

8. Compress and/or encrypt audio/video files in addition to the default configuration of uploading via secure websockets.

### Client Code

Install and verify Termux on your android device (see Termux download link above).

This software has been developed and verified on a 5G cell phone (TCL 10 5G UW on the Verizon network) running Android version 10 (kernel version 4.19.81-perf+).

The client file structure is based upon NodeJS Express HTTP localhost webserver:

    $HOME (1evel 0 folder)

        .bashrc (runs every time a new Termux shell opens)

        safety3 (level 1 folder - project folder)

            safety3tcl.js
            safety3tclfork.js
            time_exports.js

            public (level 2 folder)

                css (level 3 folder)

                    safety3.css

                images (level 3 folder)

                    favicon32x32.png

                js (level 3 folder)

                    safety3-browser.js

            views (level 2 folder)

                safety3.ntl

            video (level 2 folder for created recordings)

The .bashrc script will:

(1) Start [sshd](https://wiki.termux.com/wiki/Remote_Access) (port 8022) which allows SSH and SFTP. For simplicity, the author uses Geany and FileZilla on an Ubuntu desktop PC. Geany and FileZilla both run on Linux and Windows.

(2) Upload the BodyCamera file structure to the $HOME folder (e.g. /data/data/com.termux/files/home) of Termux on your Android device.

    git clone https://github.com/toqana/BodyCamera.git

(3) Install NodeJS and NPM in Termux:

    pkg update          # install package maintainer's version	Y or I
    pkg upgrade
    pkg search node     # should display nodejs/stable 18.7.0-1 aarch64 (or higher)
    pkg install nodejs
    node -v             # should display v18.7.0 (or higher)
    npm -v              # should display 8.15.0 (or higher)

(4) Install NPM packages (will create folder $HOME/safety3/node_modules):

    cd ~/safety3
    npm install express --save
    npm install http -- save
    npm install ip --save
    npm install util --save
    npm install websocket --save
    npm install body-parser --save

(5) Verify NodeJS runs:

    cd ~/safety3
    node safety3tcl.js  # The console.log messages should display.

(6) Kill Termux

    pkill termux

(7) Verify .bashrc by starting Termux and open a second shell window by swiping right (which should open in the ~/safety3 folder), then:

    tail -n 50 -f console.log # the console.log messages should display

(8) Kill the app:

    pkill -f safety3

### Server Code

The BodyCamera secure websockets code has beeen developed and verified on an Ubuntu 22 server.

(1) If NodeJS and NPM are not installed, then:

    sudo apt update
    sudo apt install nodejs
    node --version    # should display v12.22.12 (or higher)
    npm --version     # should display 6.14.16 (or higher)

(2) Choose a folder for the BodyCamera secure websockets app, which we will label $BODYCAMERAHOME (default is /var/www/html).

(3) Open wss1ServerPort (default = 3002) and wss2ServerPort (default 3003) with UFW (or whatever firewall program you are using).

(4) Install a SSL certificate using [Letsencrypt certbot](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04). We are only creating two secure websocket servers, not a HTTPS server.

(5) Upload $BODYCAMERAHOME/safety3wss.js and $BODYCAMERAHOME/time_exports.js. On https://github.com/toqana/BodyCamera, rather than create a separate repository, these two files are located in the safety3 folder.

(6) Install NPM packages:

    cd $BODYCAMERAHOME
    npm install ip
    npm install util
    npm install url
    npm install websocket
    npm install https

(7) Verify:

    cd $BODYCAMERAHOME
    node safety3wss.js

(8) [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/) is strongly recommended for safety3wss.js process management.

### Revsion

2022-11-24_v0

