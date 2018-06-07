// Load facebook SDK
(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "https://connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
 }(document, 'script', 'facebook-jssdk'));

// Constants and globals
const ROUTES = {
  tabpage: '/api/tabpage/',
};
const FB_LOGIN_OPTIONS = {
  return_scopes: true,
  scope: 'email,manage_pages,publish_pages,pages_messaging,pages_show_list',
}
const WEBMASTER_TOOLS_APP_ID = '231667064232503';
const TAB_PAGES_APP_ID = '206421073488301';
const addTabPageBtn = document.querySelector('#addTabPageBtn');
const loginBtn = document.querySelector('#loginBtn');
const tabPagesList = document.querySelector('#tabPagesList');
const statusText = document.querySelector('#statusText');

// Init app
window.fbAsyncInit = function() {
  FB.init({
    appId            : WEBMASTER_TOOLS_APP_ID,
    autoLogAppEvents : true,
    xfbml            : true,
    version          : 'v3.0',
    status           : true
  });
  setState(['login']);
  FB.Event.subscribe('auth.statusChange', function({status}) {
    switch(status) {
      case 'not_authorized':
        setState(['login']);
      break;
      case 'connected':
        setState(['app']);
        startApp();
      break;
    }
  });
};

// states
const STATES = ['app', 'login', 'error'];
function setState(states, _statusText) {
  STATES.forEach(state => document.body.classList.remove(state));
  states.forEach(state => document.body.classList.add(state));
  statusText.innerHTML = _statusText || '';
}

// UI
loginBtn.onclick = function(e) {
  FB.login((response) => {
  }, FB_LOGIN_OPTIONS);
};
addTabPageBtn.onclick = function(e) {
  const name = prompt('Give your tab a name', 'My custom tab page');
  if(name) {
    createTabPage({
      name: name,
    }, function(response, err) {
      if(!response) {
        displayError('An unknown error occured creating your tab page.');
      }
      else if(err) {
        displayError(`An error occured creating your tab page: ${ response.error }`);
      }
      refreshTabPageList();
    });
  }
};
// App
let userPages = [];
function startApp() {
  refreshTabPageList();
}
function refreshTabPageList() {
  getUserPages(function(data, error) {
    userPages = data;
    userPages.forEach(page => {
      getTabs(page.id, page.access_token, (data, error) => {
        page.tabs = data;
      });
    });

    // FIXME: wait untill all promises have loaded

    getTabPages(function (data, err) {
      if(err) {
        setState(['app', 'error'], 'An error occured while loading the user\'s tab pages:' + err);
      }
      else {
        tabPagesList.innerHTML = '';
        tabPagesList.setAttribute('readonly', true);
        const fragment = document.createDocumentFragment();
        data.forEach(tabPage => {
          // check that the tab is linked to a page in facebook and get the link
          // check that the page has the tab page app  
          // for(let tab in data) {
          //   if(tab.id === TAB_PAGES_APP_ID) {
          //     page.hasCustomTabPage = true;
          //   }
          // }
          const userPage = userPages.reduce((prev, userPage) => userPage.id === tabPage.fbPageId ? userPage : prev, {});
          const li = document.createElement('li');
          li.className = 'card';
          li.innerHTML = `
            <h2>Page Tab</h2>
            <form class="body" action="#">
              <div class="name">
                <label>Page Tab Name</label>
                <input class="input" name="name" type="text" value="${ tabPage.name || '' }" placeholder="Your tab page name" />
              </div>
              <div class="url">
                <label>Secure Page Tab URL</label>
                <input class="input" name="url" type="url" value="${ tabPage.url || '' }" placeholder="Your tab page URL" />
              </div>
              <div class="page">
                <label>Facebook Page</label>
                <select class="fbPageSelector" name="fbPageId">
                  <option value=""></option>
                  ${ userPages.map(userPage => `
                    <option 
                      data-access-token="${ userPage.access_token }"
                      value="${ userPage.id }"
                      ${ userPage.id === tabPage.fbPageId ? 'selected' : '' }
                      >${ userPage.name }</option>
                  `).join('') }
                </select>
                <input class="input" name="position" type="number" value="${ tabPage.position }" />
              </div>
              ${ userPage.name ? `
                <div class="links">
                  <label>Links</label>
                  <ul>
                    <li class="link"><span class="fas fa-external-link-alt"></span><a target="_blank" href="https://www.facebook.com/${ userPage.name }-${ userPage.id }">${ userPage.name }</a></li>
                    <li class="link"><span class="fas fa-cog"></span><a target="_blank" href="https://www.facebook.com/${ userPage.name }-${ userPage.id }/settings/?tab=edit_page">Settings</a></li>
                  </ul>
                </div>
              ` : '' }
              <input class="submitBtn" type="submit" disabled value="Save" />
            </form>
          `;
          fragment.appendChild(li);
          const fbPageSelector = li.querySelector('.fbPageSelector')
          const form = li.querySelector('.body')
          const submitBtn = li.querySelector('.submitBtn')
          form.addEventListener('click', (e) => setDirty(submitBtn));
          form.addEventListener('change', (e) => setDirty(submitBtn));
          form.addEventListener('blur', (e) => setDirty(submitBtn));
          form.addEventListener('submit', function (e) {
            e.preventDefault();
            submitBtn.disabled = true;
            submitBtn.value = 'Saving';
            const accessToken = fbPageSelector.selectedOptions[0].getAttribute('data-access-token');
            const inputs = Array.from(document.querySelectorAll('[name]'));
            const pageTabData = inputs.reduce((acc, input) => {
              acc[input.getAttribute('name')] = input.value;
              return acc;
            }, {});
            pageTabData.fbPageAccessToken = accessToken;
            saveTabPage(tabPage, pageTabData, function (response) {
              // FIXME: handle errors
              submitBtn.disabled = true;
              submitBtn.value = 'Saved!';
            });
          });
        });
        tabPagesList.appendChild(fragment);       
      }
    });
  });
}
function setDirty(submitBtn) {
  submitBtn.disabled = false;
  submitBtn.value = 'Save';
}
// Facebook API
function getTabs(fbPageId, access_token, cbk) {
  // Use the graph API to read all the tabs in a 
  // https://developers.facebook.com/docs/graph-api/reference/page/tabs/
  FB.api(
    `/${ fbPageId }/tabs`,
    {access_token: access_token},
    function (response) {
      cbk(response.data, response.error);
    }
  );
};

// Use the graph API to create a tab at a given position and name 
// https://developers.facebook.com/docs/graph-api/reference/page/tabs/
function attachPageToTab(pageTabData, app_id, cbk) {
  // FIXME: should be on the server side
  FB.api(
    `/${ pageTabData.fbPageId }/tabs`,
    'POST',
    {
      access_token: pageTabData.fbPageAccessToken,
      app_id: app_id,
      position: pageTabData.position,
      custom_image_url: pageTabData.fbImageUrl,
      custom_name: pageTabData.name,
    },
    response => {
      cbk(response);
    }
  );
};

function getUserPages(cbk) {
  FB.api('/me/accounts', function(response) {
    cbk(response.data, response.error);
  });
}

// API
function saveTabPage(tabPage, pageTabData, cbk) {
  // No: update the name and position: if(pageTabData.fbPageId !== tabPage.fbPageId) {
    attachPageToTab(pageTabData, TAB_PAGES_APP_ID, function (response) {
      doSaveTabPage(tabPage, pageTabData, cbk);
    });
  // }
  // else {
  //   doSaveTabPage(tabPage, pageTabData, cbk);
  // }
}
function doSaveTabPage(tabPage, pageTabData, cbk) {
  updateTabPage(tabPage._id, Object.assign({}, pageTabData, {
    fbAppId: TAB_PAGES_APP_ID,
  }), cbk);
}
function updateTabPage(tabPageId, data, cbk) {
  loadData({method: 'POST', url: ROUTES.tabpage + tabPageId, data: data}, cbk);
}
function createTabPage(data, cbk) {
  loadData({method: 'POST', url: ROUTES.tabpage, data: data}, cbk);
}
function getTabPages(cbk) {
  loadData({method: 'GET', url: ROUTES.tabpage}, cbk);
}
function loadData({method, url, data}, cbk) {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", function(e) {
    if(oReq.status === 200 && oReq.responseText) {
      cbk(JSON.parse(oReq.responseText));
    }
    else {
      console.error('load data error', oReq.status, oReq.statusText);
      cbk(null, oReq.statusText || 'Unknown error with status ' + oReq.status);
    }
  });
  oReq.open(method, url);
  oReq.setRequestHeader('Content-type', 'application/json');
  if(data) {
    oReq.send(JSON.stringify(data));
  }
  else {
    oReq.send();
  }
}
