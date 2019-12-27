# calendar-integration

Add portlet to Liferay (7.2) `npm run build` and then deploy it manually by copying the .jar from the `/dist` directory to your liferay server, add it to a page and configure it (on the page via the settings) with a server address and a calendar-id
```
Server address: http://localhost:8008 (if default and hosted locally)

Example calendars to use
    nhl_6_%45dmonton+%4filers#sports@group.v.calendar.google.com,
    nhl_30_%4dinnesota+%57ild#sports@group.v.calendar.google.com,
    fi.finnish#holiday@group.v.calendar.google.com

    you can use multiple calendars at once by separating IDs with , 

    example fi.finnish#holiday@group.v.calendar.google.com,nhl_6_%45dmonton+%4filers#sports@group.v.calendar.google.com
```
Create a Google Service account, download the details as json, name the file `privatekey.json` and place it in `./server/gcal_server`

File should look like`
```
{
    "type": "service_account",
    "project_id": "(id)",
    "private_key_id": "(id)",
    "private_key": "-----BEGIN PRIVATE KEY-----(key)-----END PRIVATE KEY-----\n",
    "client_email": "(name).iam.gserviceaccount.com",
    "client_id": "(id)",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/kalenteri-testi%40integration-1573461862752.iam.gserviceaccount.com"
}  
```


Run the server and database 
```
cd ./server
docker-compose build
docker-compose up
```
