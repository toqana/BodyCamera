#!/data/data/com.termux/files/usr/bin/sh

printf "START: .bashrc at " >> ~/bashrc.log
date >> bashrc.log

if pgrep -x "sshd" > /dev/null
then
  echo "sshd is running" >> ~/bashrc.log
  # pkill sshd
else
  echo "sshd will be started" >> ~/bashrc.log
  sshd
fi

if pgrep -f "safety3tcl.js" > /dev/null

then
  
  echo "safety3tcl.js is running" >> ~/bashrc.log
  
else
  
  echo "node safety3tcl.js will be started" >> ~/bashrc.log
  cd ~/safety3
  node safety3tcl.js 2>&1 >> ./console.log
  
fi

printf "END:   .bashrc end\n\n" >> ~/bashrc.log
