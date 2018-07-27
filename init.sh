#!/bin/bash

echo "Create new database? (y/n)"

read response_1

if [ "${response_1}" = 'y' ] ; then 
	rm -rf db.txt

	echo "User Database: " >> db.txt

	echo "email	|	encrypted token" >> db.txt

fi 

echo "print database? (y/n)"

read response_2 

if [ "${response_2}" = 'y' ] ; then 
	cat db.txt
fi

