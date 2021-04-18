tick_count = 0;
cur_url = "test";

function getUrlVars() { 
  var vars = {}; 
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) { vars[key] = value; }); 
  return vars; 
}

function deleteAllCookies() {
    var cookies = document.cookie.split(";");
for (var i = 0; i < cookies.length; i++) { var cookie = cookies[i]; var eqPos =          cookie.indexOf("="); var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
document.cookie = name+'="";-1; path=/';
}
}
 
last_click = 0;
last_call = 0;
reload = 0;
enabled = 0;
no_buttons = false;
overlimit = false;
r_interval = 0;

first = true;
followingDlg = null;

var config = {
	enable : 0,
	total : 0,
	max : 0,
	chance: 75,
	interval : 0
}

function get_random(lmin,lmax){
	var c = parseInt(lmin);
	c = c + Math.floor(Math.random() * lmax);
	if(c > lmax) { c = lmax; };
	return c;
}

const $profile_header = '[data-test-id="profile-header"]';
const $following_dialog = '[role="dialog"][aria-label="Following"]';
const $followButtons = '[data-testid$="-unfollow"]';
const $confirmButton = '[data-testid="confirmationSheetConfirm"]';

function unfollow(){

	var cnt = 0;
	
	var btns = document.getElementsByTagName('button');
	if (!btns) { 
	
		no_buttons = true;
		return; 
	}
	
	var txt;
	for(var i=0; i<btns.length;i++){
		txt = btns[i].innerHTML;
		if(!txt){ continue; }
		if(txt.indexOf("Unfollow") === -1) { continue; }

        console.log("Unfollow !");
		config.total++;
        click_action = tick_count;

		btns[i].scrollIntoView();
		btns[i].click();
		
		setTimeout(function(){
					const confirmButton = document.querySelector($confirmButton);
					confirmButton && confirmButton.click();
		},200);
		
		
		chrome.extension.sendMessage({action: 'inc'}, function(response){
			if(response.status == false)
				config.enable = 0;
		});
		cnt++;
		break;
	}

	if(cnt < 1){
	
		no_buttons = true;
	}

}
 
function show_info(){

	if(!followingDlg){
		var info = document.getElementById("info_ex");
		if(!info) {
	
			info = document.createElement('div');
			info.style.cssText = "position: fixed; bottom: 0; width:100%; z-index: 999;background-color: #F5FACA; border-style: solid;  border-width: 1px; margins: 5px; paddingLeft: 10px; paddingRight: 10px;";
			info.innerHTML = "<center><h3 id='status_ex'>active</h3></center>";
			info.id = "info_ex";
			document.body.appendChild(info);
			console.log("info_ex created");
		}
	} else {
		var info = document.getElementById("info_dlg_ex");
		if(!info) {
	
			info = document.createElement('div');
			info.style.cssText = "position: fixed; bottom: 0; width:100%; z-index: 999;background-color: #F5FACA; border-style: solid;  border-width: 1px; margins: 5px; paddingLeft: 10px; paddingRight: 10px;";
			info.innerHTML = "<center><h3 id='status_dlg_ex'>active</h3></center>";
			info.id = "info_dlg_ex";
			followingDlg.appendChild(info);
			console.log("info_dlg_ex created");
		}
	}
}
	
function info(txt){

	if(!followingDlg){
		var info = document.getElementById("status_ex");
		if(!info) { return; }
		info.textContent = "Unfollow : "+config.total+", "+txt;
	} else {
		var info = document.getElementById("status_dlg_ex");
		if(!info) { return; }
		info.textContent = "Unfollow : "+config.total+", "+txt;
	}
}

function IsProfilePage(){
	
	var p = document.querySelector($profile_header);
	if(!p){ return false; }
	return true;
}

function IsDialogOpen(){
		
	followingDlg = document.querySelector($following_dialog);
	if(!followingDlg) { return false; }
	return true;
}

//<div class="FNs zI7 iyn Hsu"><div aria-disabled="false" class="CCY czT eEj FTD L4E DI9 BG7" role="button" tabindex="0"><span class="tBJ dyH iFc yTZ pBj DrD IZT mWe">1.3k following</span></div></div>
function OpenFollowingDialog(){

	var btn = document.querySelectorAll('[role="button"]');
	if(!btn) { return; }
	
	var txt;
	for(var i=0; i<btn.length; i++){
		txt = btn[i].textContent;
		if(!txt) { continue; }
		if(txt.indexOf("following") == -1) { continue; }
		btn[i].click();
		break;
	}
	
}

	
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.action === "set") {
		config.enable = request.enable;
		config.total = request.total;
		config.max = request.max;
		config.chance = request.chance;
		config.interval = request.interval;
		tick_count = 0;
		if(!config.enable){
			var info = document.getElementById("info_ex");
			if(info) {
				info.parentNode.removeChild(info);
			}

			info = document.getElementById("info_dlg_ex");
			if(info) {
				info.parentNode.removeChild(info);
			}
			
			config.total = 0;
			overlimit = false;
			first = true;			
		}
	}
});
 
    chrome.extension.sendMessage({}, function(response) {
    
	   var readyStateCheckInterval = setInterval(function() {
	       if (document.readyState === "complete") {

		   if(first){
				first = false;
				chrome.runtime.sendMessage({action: "get"}, function(response){
	
					config.enable = response.enable;
					config.total = response.total;
					config.max = response.max;
					config.chance = response.chance;
					config.interval = response.interval;
					
					r_interval = get_random(config.interval,config.chance); 
					console.log("got interval : "+r_interval);
				});
		   }
		   
		   cur_url = $(location).attr('href');		   
           tick_count= tick_count+1; 

		   
		   if((config.enable == 1) && (cur_url.indexOf('pinterest.com') !== -1) && (config.total < config.max)){

		   
		   show_info();

		   if(!IsProfilePage()){
		
				info("Please go to Pinterest Profile Page");
				return;
			}
	
			if(!IsDialogOpen()){

				setTimeout(function(){
					OpenFollowingDialog();
				},1000);
				
				return; 
			}
		   
			
			if (overlimit) {
				
				if((tick_count % 10) == 0){	info("Reached Total Limit : "+config.total); }
				return;
			}
			   
			if(no_buttons) {

				if(tick_count > 30){
			
					console.log("No Button, Reload");
					window.location.href=cur_url;
				} else {
					var c = 30 - tick_count;
					info("Waiting For "+c+" seconds to reload");
				}
		
				return;
			}
			   
				if (tick_count >= r_interval){
			    
					tick_count = 0;
					unfollow();
					r_interval = get_random(config.interval,config.chance); 
					console.log("got interval : "+r_interval);
					
					if(config.total >= config.max){ overlimit = true; info("Reached Total Limit : "+config.total); }
				} else {
					info("Waiting for : "+(r_interval - tick_count));
				}
				
		   } else {
			console.log('tick disable');
		   }

	   }
	}, 1000);
	
});

