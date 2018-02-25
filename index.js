
/*
=================================
Event Listeners
=================================
*/

var btn = document.getElementById('new-quote');

// Hide previous quote and retrieve new quote
btn.addEventListener('click', function(){
	document.getElementById('quote-text').classList.remove('is-visible');
	document.getElementById('quote-author').classList.remove('is-visible');
	run(main);
});

// Animate twitter logo on hover 
var logo = document.getElementById('twitter-logo');
logo.addEventListener('mouseover', function(){
	document.getElementById('twitter-logo-body').classList.add('is-animated');
	document.getElementById('twitter-logo-wings').classList.add('is-animated');
})

logo.addEventListener('mouseout', function(){
	document.getElementById('twitter-logo-body').classList.remove('is-animated');
	document.getElementById('twitter-logo-wings').classList.remove('is-animated');
})


// Animate refresh button on click
var refresh = document.getElementById('new-quote');
refresh.addEventListener('click', function(){
	if(!refresh.classList.contains('is-animated')){
		refresh.classList.add('is-animated');
		setTimeout(function(){
			refresh.classList.remove('is-animated');
		},1500);
	}
})

/*
==========================================
Utility Functions
==========================================
*/

// Generate random number from 1 to 999999 for use in random quote query 
function keyGen(){
	var key = Math.round(Math.random()*1000000);
	if (key > 999999) {
		key = 999999;
	}
	if (key === 0) {
		key = 1;
	}
	return key
}

// Generate random number between 0 and 50 for use in colorGen function
function randHalf() {
	return Math.floor((Math.random() * 100) / 2)
}

// Generate random color by mixing two primary colors
function colorGen() {
	var rgb = [randHalf(), randHalf(), randHalf()];
	var rgbArr=[(100-rgb[0]) + '%', (100-rgb[1]) + '%',(100-rgb[2]) +'%'];
	var ZeroToTwo = (Math.floor(Math.random() * 10) % 3);
	rgbArr[ZeroToTwo] = '0%';
	var color = 'rgb(' + rgbArr.join(',') + ')';
	return color;
}

// Generate random color using colorGen function and apply it to appropriate elements
function applyColor(){
	var color = colorGen();
	var container = document.getElementById('container');
	var quote = document.getElementById('quote');
	container.style.backgroundColor = color;
	quote.style.color = color;
	logo.style.fill = color;
	refresh.style.stroke =color;
}

// generates query based on current quote and adds it as link to twitter logo
function twitterLink(quoteObj) {
	var query = '?hashtags=quotes&related=freecodecamp&text="'+ encodeURI(quoteObj.quoteText) + '"%20' + encodeURI(quoteObj.quoteAuthor);
	var twitter = document.getElementById('twitter');
	twitter.href = 'https://twitter.com/intent/tweet' + query;
}

// display quote returned by api call
function displayQuote(quoteObj) {
	var quote = document.getElementById('quote');
	var text = document.getElementById('quote-text');
	var author = document.getElementById('quote-author');
	text.textContent = quoteObj.quoteText;
	quoteObj.quoteAuthor !== '' ? author.textContent = quoteObj.quoteAuthor : author.textContent = 'Unknown';
	text.classList.add('is-visible');
	author.classList.add('is-visible');
}

/*
===============================================
Functions used in API calls
===============================================
*/

// Credit to YDKJS for promise aware generator runner
function run(gen) {
	var args = [].slice.call(arguments, 1), it;
	it = gen.apply(this, args);
	return Promise.resolve()
		.then(function handleNext(value) {
			var next = it.next(value);
			return (function handleResult(next) {
				if (next.done) {
					return next.value;
				}
				else {
					return Promise.resolve(next.value)
					.then(handleNext, function handleErr(err) {
						return Promise.resolve(it.throw(err))
						.then(handleResult);
					})
				}
			})(next);
		})
}


// returns a promise using the XMLRequest object
function request(){
	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'https://cors-anywhere.herokuapp.com/http://api.forismatic.com/api/1.0/?method=getQuote&' + keyGen() + '&format=json&lang=en');
		xhr.onload = function() {
			if(xhr.status >= 200 && xhr.status < 400){
				resolve(xhr.response);
			}
			else {
				reject(xhr.statusText);
			}
		}
		xhr.onerror = function() {
			reject(xhr.statusText);
		}
		xhr.send();	
	})
	
}

// makes api request for new quote and displays quote after a delay to allow for css transitions to complete
function *main() {
	try {
		applyColor();
		var p = yield request();
		p = p.replace(/\\'/g, '\'');
		var quote = JSON.parse(p);
		setTimeout(function(){
			twitterLink(quote);
			displayQuote(quote);
		}, 500)
	}
	catch (err) {
		console.error(err);
		run(main)
	}
}

run(main);

