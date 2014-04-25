#!/bin/bash
echo "Installing board packages ..."
opkg install packages/*
echo "Setting time ..."
ntpdate pool.ntp.org
echo "Installing NodeJS packages ..."
npm install
