/*############################################################################*
 *#                                                                          #*
 *#   Amarok-Script for listening to music from SoundCloud                   #*
 *#                                                                          #*
 *#   Copyright (C) 2014 Sven Sperner <cethss@gmail.com>                     #*
 *#                                                                          #*
 *#   This program is free software; you can redistribute it and/or modify   #*
 *#   it under the terms of the GNU General Public License as published by   #*
 *#   the Free Software Foundation; either version 3 of the License, or      #*
 *#   (at your option) any later version.                                    #*
 *#                                                                          #*
 *#   This program is distributed in the hope that it will be useful,        #*
 *#   but WITHOUT ANY WARRANTY; without even the implied warranty of         #*
 *#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the          #*
 *#   GNU General Public License for more details.                           #*
 *#                                                                          #*
 *#   You should have received a copy of the GNU General Public License      #*
 *#   along with this program. If not, look @ <http://www.gnu.org/licenses>. #*
 *#                                                                          #*
 *############################################################################*/

Importer.loadQtBinding( "qt.core" );
Importer.loadQtBinding( "qt.xml" );
Importer.loadQtBinding( "qt.network" );
Importer.loadQtBinding( "qt.gui" );



var clientID = "?client_id=YOUR_CLIENT_ID";
var serviceUrl = new QUrl( "http://api.soundcloud.com/tracks" + clientID );


function SoundCloud( )
{
	ScriptableServiceScript.call( this, "SoundCloud", 1, "Stream music from SoundCloud", "http://soundcloud.com", true );

	var downloader = new Downloader( serviceUrl, populateTracks );
}

function populateTracks( tracks )
{
	var doc = new QDomDocument;
	doc.setContent( tracks );
	trackList = doc.elementsByTagName( "track" );

	Amarok.debug( "SoundCloudScript: populateTracks:\nFetched " + trackList.length() + " tracks!" );

	var track;
	var item;
	for( var i=0; i<trackList.length(); i++ )
	{
		try {
			track = trackList.at( i ); 

			item = Amarok.StreamItem;
			item.level = 0;
			item.itemName = track.firstChildElement("title").text( );
			item.artist = track.firstChildElement("user").firstChildElement("username").text( );
			item.composer = track.firstChildElement("user").firstChildElement("username").text( );
			item.album = "SoundCloud.com";
			item.genre = track.firstChildElement("genre").text( );
			item.year = track.firstChildElement("release-year").text( );
			item.playableUrl = track.firstChildElement("stream-url").text( ) + clientID;
			item.infoHtml = track.firstChildElement("permalink-url").text( );
			//item.callbackData = track.firstChildElement("").text( );

			script.insertItem( item );

// 			if( i == 0 )
// 			{
// 				Amarok.alert( "Inserted Item " + i +
// 					      "\nwith Name: " 	+ item.itemName +
// 					      "\nwith Artist: " + item.artist +
// 					      "\nwith pUrl: " 	+ item.playableUrl +
// 				);
// 			}
		}
		catch( error ) {
			Amarok.alert( error );
		}
	}
	script.donePopulating( );
}


function onPopulate( level, callbackData, filter )
{
	Amarok.debug( "SoundCloudScript: onPopulate: " + level + ",\ncallbackData: " + callbackData + ",\nfilter: " + filter );

	if (filter != "")
	{
		filter = filter.replace( /%20/g, " " );
		filter = filter.trim().toLowerCase( );

		var queryUrl = new QUrl( serviceUrl );
		queryUrl.addQueryItem( "q", filter );
		queryUrl.addQueryItem( "filter", "streamable" );
		var downloader = new Downloader( queryUrl, populateTracks );

  		Amarok.debug( "SoundCloudScript: onPopulate: URL: " + queryUrl );
	}
}

function onCustomize( )
{
	Amarok.debug( "SoundCloudScript: onCustomize" );

	var path = Amarok.Info.scriptPath() + "/";
	script.setIcon( new QPixmap(path + "soundcloud_icon.png") );
	script.setEmblem( new QPixmap(path + "soundcloud_emblem.png") );
}

function onConfigure( )
{
	Amarok.debug( "SoundCloudScript: onConfigure" );

	//Nothing to configure by now...
}



script = new SoundCloud( );
script.populate.connect( onPopulate );
script.customize.connect( onCustomize );
Amarok.configured.connect( onConfigure );


