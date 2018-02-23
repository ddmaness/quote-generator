
function keyGen(){
	var key = Math.round(Math.random()*1000000);
	if (key > 999999) {
		key = 999999;
	}
	return key
}


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

function twitterLink(quoteObj) {
	var query = '?hashtags=quotes&related=freecodecamp&text="'+ encodeURI(quoteObj.quoteText) + '"%20' + encodeURI(quoteObj.quoteAuthor);
	var twitter = document.getElementById('twitter');
	twitter.href = 'https://twitter.com/intent/tweet' + query;
}

function *main() {
	try {
		var p = yield request();
		p = p.replace(/\\'/g, '\'')
		var quote = JSON.parse(p);
		twitterLink(quote);
		displayQuote(quote);
	}
	catch (err) {
		console.error(err);
	}
	console.log(quote);	
}

function newQuote() {
	var btn = document.getElementById('new-quote');
	btn.addEventListener('click', run(main))
}

function displayQuote(quoteObj) {
	var quote = document.getElementById('quote');
	var author = document.getElementById('author');
	quote.textContent = quoteObj.quoteText;
	author.textContent = quoteObj.quoteAuthor;
}


run(main);
var btn = document.getElementById('new-quote');
btn.addEventListener('click', function(){
	run(main);
});