## Admin front end

> a reactjs app

Display a list of "tab pages" for the logged in user:

* name
  + edit
  + link to tab
  + link to RedirAction for sharing
  + delete
* Facebook page name
  + link to page
  + link to page settings
  + remove from page or add to page
* url + edit
* [image + edit]
* [position + edit]

Actions: create, help, about

## Admin backend

> [Facebook app ID 231667064232503](https://developers.facebook.com/apps/231667064232503/settings/basic/)
> expressjs app

Serve the admin front end to a Facebook tab.

Exposes routes to administrate tab pages.

Concerning where the data lives:

* in mongo: list of tab pages with these data:
  * userId
  * pageId
  * url
  * name
  * [image]
  * [position]
  + link to tab
  + link to page settings
  + link to RedirAction for sharing
* in facebook
  * list of pages for the current user
  * list of tab pages for each page

## Smart Tab

> [Facebook app ID 206421073488301](https://developers.facebook.com/apps/206421073488301/settings/basic/)
> Same expressjs app as the admin backend, '/page-tab/' route

Redirect tab page to the URL defined by the user.

