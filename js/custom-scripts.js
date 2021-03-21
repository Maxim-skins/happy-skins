
/* JS: 297b9936-1443-11e7-93ae-92361f002671 */

var socket,
    steamid,
    tradelink,
    socketid,
    balance = 0,
    bank_jackpot = 0,
    itemsselected_steam = [],
    itemsselected_inventory = [],
    pagetags = '1, 2, 3, 4',
    sumselect_steam = 0,
    sumselect_inventory = 0,
    connected = false,
    chat = true,
    page = 1,
    currentpage = '',
    countdown_int = '',
    countdown_roulette_int = '',
    tradeoffer = [],
    tradelinkint,
    onclicktriggered = false,
    current_page = 1,
    language = 'rus',
    ip = 0,
    withdraw_cacheItems = [],
    deposit_cacheItems = [],
    withdraw_pages = 0,
	CHAT_CHANNEL = "eng",
	invCache = 0;

var appid = 0;

var withdrawPages = 1;
var withdrawCurrentPage = 0;
var withdrawContainer = [];

var depositPages = 1;
var depositCurrentPage = 0;
var depositContainer = [];

var cacheItems = [];
var cacheItems2 = [];
var depositItems = [];
const cyrillicPattern = /[\u0400-\u04FF]/;

var errors = [''];
var banned_websites = [''];
var itemlist_fix = {
    list: [],
    available: [],
    filter: '',
    from: 0,
    to: 500000,
    bot: -1,
    deposit: false,
    applyChanges: function() {
        this.available = [];
        for (var i = 0; i < this.list.length; i++) {
            var item = this.list[i];
            if ((!this.deposit && this.bot > -1 && item.bot != this.bot) || item.price > this.to || item.price < this.from) continue;
            if (this.filter != '' && item.market_hash_name.search(new RegExp(this.filter, "i")) < 0) continue;
            this.available.push(item);
        }
    }
};

function animateRouletteTimer(elem, num, sec) {
	var pref = '';
	if(num <= 10) pref = '0'
	var options = {
		useEasing : false,
		useGrouping : true,
		separator : ',',
		decimal : '.',
		prefix : pref,
		suffix : ''
	};
	var num2 = num;
	if(num != 0) num2--;
	var demo = new CountUp(elem, num, num2, 2, 1, options);
	demo.start();
}

function setHash(hash) {
	$("#hash").text("Hash: " + hash);
}

function select_csgo() {
	appid = 730;
	console.log('Change ' + appid);
}

function select_dota2() {
	appid = 570;
	console.log('Change ' + appid);
}

function convertid(steamid) {
    return steamid.substr(3) - 61197960265728;
}

function log(string, number) {
    var output = '';
    for (var i = 0; i < number; i++) {
        output += '-';
    }
}

function rnd(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

var translator;

$(document).ready(function() {

	$(".content-section-title").each(function() {
		$(this).addClass("trn");
	});

	$("th").each(function() {
		$(this).addClass("trn");
	});

	$("a").each(function() {
	});

	$("span a").each(function() {
		$(this).addClass("trn");
	});

	$('.lang-selector').each(function() {
		$(this).removeClass("trn");
	});

	$("#current-language").removeClass("trn");

	translator = $('body').translate({lang: language, t: l});

	toastr.options = {
		"timeOut": "5000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "slideDown",
		"hideMethod": "fadeOut"
	}

	$("#past-queue-more").css("display", "none");

	$("#past-queue-more").click(function() {
		$('#past-queue').animate({
			scrollTop: ($("#past-queue-wrapper").offset().top + $("#past-queue-wrapper").height())
		}, 1000);
		$("#past-queue-more").css("display", "none");
	});

	$("#bet-btn-10").click(function() {
		var num = parseFloat($("#bet-input").val());
		var finish = Math.floor(num + 10);
		$("#bet-input").val(finish);
	});
	$("#bet-btn-100").click(function() {
		var num = parseFloat($("#bet-input").val());
		var finish = Math.floor(num + 100);
		$("#bet-input").val(finish);
	});
	$("#bet-btn-1k").click(function() {
		var num = parseFloat($("#bet-input").val());
		var finish = Math.floor(num + 1000);
		$("#bet-input").val(finish);
	});
	$("#bet-btn-10k").click(function() {
		var num = parseFloat($("#bet-input").val());
		var finish = Math.floor(num + 10000);
		$("#bet-input").val(finish);
	});
	$("#bet-btn-half").click(function() {
		var num = parseFloat($("#bet-input").val());
		var finish = Math.floor(num / 2);
		$("#bet-input").val(finish);
	});
	$("#bet-btn-double").click(function() {
		var num = parseFloat($("#bet-input").val());
		var finish = Math.floor(num * 2);
		$("#bet-input").val(finish);
	});
	$("#bet-btn-max").click(function() {
		var finish = balance;
		$("#bet-input").val(finish);
	});
	$("#bet-btn-min").click(function() {
		var finish = 0;
		$("#bet-input").val(finish);
	});

	$("#bet-btn-2x").click(function() {
		betDouble("grey")
	});

	$("#bet-btn-3x").click(function() {
		betDouble("red")
	});

	$("#bet-btn-5x").click(function() {
		betDouble("blue")
	});

	$("#bet-btn-50x").click(function() {
		betDouble("gold")
	});

	$("#inventory-refresh-csgo").click(function() {
		loadInventorySteamCsgo();
	});

	$("#inventory-refresh-dota2").click(function() {
		loadInventorySteamDota2();
	});

	$("#shop-refresh-csgo").click(function() {
		loadInventoryWebsiteCsgo();
	});

	$("#shop-refresh-dota2").click(function() {
		loadInventoryWebsiteDota2();
	});

	$("#bet-refresh").click(function() {
		$("#bet-refresh").css("display", "none");
		$("#bet-loader").css("opacity", "1");
		$("#bet-loader").css("display", "inline-block");
		socket.emit('load_last_bets', {
			steamid: steamid,
			salt: salt
		});
		if(language == "rus") Materialize.toast("Последние ставки обновлены.", 4000);
		if(language == "eng") Materialize.toast("Last bets updated.", 4000);
		if(language == "de") Materialize.toast("Letzte änderung raten.", 4000);
		if(language == "pl") Materialize.toast("Ostatnia zmiana stawki.", 4000);
		if(language == "turk") Materialize.toast("Son bahisler güncellendi.", 4000);
		if(language == "ch") Materialize.toast("最后更新的赌注。", 4000);
	});

	$("#transaction-refresh").click(function() {
		$("#transaction-refresh").css("display", "none");
		$("#transaction-loader").css("opacity", "1");
		$("#transaction-loader").css("display", "inline-block");
		socket.emit('load_withdraw_stat', {
			steamid: steamid,
			salt: salt
		});
		if(language == "rus") Materialize.toast("Последние операции обновлены.", 4000);
		if(language == "eng") Materialize.toast("Last operations updated.", 4000);
		if(language == "de") Materialize.toast("Die letzten Operationen aktualisiert.", 4000);
		if(language == "pl") Materialize.toast("Ostatnich transakcji zaktualizowane.", 4000);
		if(language == "turk") Materialize.toast("Son işlemleri güncellendi.", 4000);
		if(language == "ch") Materialize.toast("最后一个操作进行更新。", 4000);
	});

	$("#sends-refresh").click(function() {
		$("#sends-refresh").css("display", "none");
		$("#sends-loader").css("opacity", "1");
		$("#sends-loader").css("display", "inline-block");
		socket.emit('load_last_send', {
			steamid: steamid,
			salt: salt
		});
		if(language == "rus") Materialize.toast("Последние переводы обновлены.", 4000);
		if(language == "eng") Materialize.toast("Last translations updated.", 4000);
		if(language == "de") Materialize.toast("Die letzten übersetzungen aktualisiert.", 4000);
		if(language == "pl") Materialize.toast("Ostatnie tłumaczenia zaktualizowane.", 4000);
		if(language == "turk") Materialize.toast("Son transferler güncellendi.", 4000);
		if(language == "ch") Materialize.toast("最近更新的翻译。", 4000);
	});

	$("#inventory-input").change(function() {
        var $this = $(this);
        $("#inventory .inventory-item").show();
        $("#inventory .inventory-item").each(function() {
            if ($(this).find('.item-name').html().toLowerCase().indexOf($this.val().toLowerCase()) == -1) {
                $(this).hide();
            }
        })
    });

	$("#inventory-search").click(function() {
        var $this = $("#inventory-input");
		$("#inventory-search").css("display", "none");
		$("#inventory-search-loader").css("opacity", "1");
		$("#inventory-search-loader").css("display", "inline-block");
        $("#inventory .inventory-item").show();
        $("#inventory .inventory-item").each(function() {
            if ($(this).find('.item-name').html().toLowerCase().indexOf($this.val().toLowerCase()) == -1) {
                $(this).hide();
            }
        })
		$("#inventory-search-loader").animate({opacity: 0}, 1000, function() {
			$("#inventory-search").css("display", "inline-block");
			$("#inventory-search-loader").css("display", "none");
		});
    });

	$("#shop-search").click(function() {
        var $this = $("#shop-input");
		$("#shop-search").css("display", "none");
		$("#shop-search-loader").css("opacity", "1");
		$("#shop-search-loader").css("display", "inline-block");
        $("#shop .shop-item-wrapper").show();
        $("#shop .shop-item-wrapper").each(function() {
            if ($(this).data("original-title").toLowerCase().indexOf($this.val().toLowerCase()) == -1) {
                $(this).hide();
            }
		});
		$("#shop-search-loader").animate({opacity: 0}, 1000, function() {
			$("#shop-search").css("display", "inline-block");
			$("#shop-search-loader").css("display", "none");
		});
    });

	$("#shop-input").change(function() {
        var $this = $(this);
        $("#shop .shop-item-wrapper").show();
        $("#shop .shop-item-wrapper").each(function() {
            if ($(this).data("original-title").toLowerCase().indexOf($this.val().toLowerCase()) == -1) {
                $(this).hide();
            }
        })
    });

	$("#referral-submit").click(function() {
		var code = $("#referral-input").val();
		if(code.length < 5) {
			if(language == "rus") Materialize.toast("Реферальный код не может быть меньше 5 символов.", 4000);
			if(language == "eng") Materialize.toast("The referral code cannot be less than 5 characters.", 4000);
			if(language == "de") Materialize.toast("Die Kennung kann nicht weniger als 5 Zeichen lang sein.", 4000);
			if(language == "pl") Materialize.toast("Kod polecający nie może być mniejsza niż 5 znaków.", 4000);
			if(language == "turk") Materialize.toast("Başvuru kodu olabilir az 5 karakter.", 4000);
			if(language == "ch") Materialize.toast("推介的代码不能少于5人物。", 4000);
			return;
		}
		if(code.length > 10) {
			if(language == "rus") Materialize.toast("Реферальный код не может быть больше 10 символов.", 4000);
			if(language == "eng") Materialize.toast("The referral code cannot be more than 10 characters.", 4000);
			if(language == "de") Materialize.toast("Die Kennung kann nicht größer sein als 10 Zeichen.", 4000);
			if(language == "pl") Materialize.toast("Kod polecający nie może być więcej niż 10 znaków.", 4000);
			if(language == "turk") Materialize.toast("Başvuru kodu en fazla 10 karakter.", 4000);
			if(language == "ch") Materialize.toast("推介的代码不能超过10字符。", 4000);
			return;
		}
		if(cyrillicPattern.test(code)) {
			Materialize.toast(translator.get('Введите корректный реферальный код.'), 4000);
			return;
		}
		$("#referral-submit").css("display", "none");
		$("#referral-loader").css("opacity", "1");
		$("#referral-loader").css("display", "inline-block");
		setTimeout(function() {
			$("#referral-loader").animate({opacity: 0}, 1000, function() {
				$("#referral-submit").css("display", "inline-block");
				$("#referral-loader").css("display", "none");
			});
		}, 1000);

		socket.emit('enter_refcode', {
			steamid: steamid,
			salt: salt,
			refcode: code
		});
	});

	$("#promo-submit").click(function() {
		var code = $("#promo-input").val();

		if(code.length < 5) {
			if(language == "rus") Materialize.toast("Промо-код не может быть меньше 5 символов.", 4000);
			if(language == "eng") Materialize.toast("Promo code may not be less than 5 characters.", 4000);
			if(language == "de") Materialize.toast("Promo-Code kann nicht weniger als 5 Zeichen lang sein.", 4000);
			if(language == "pl") Materialize.toast("Kod promocyjny może być mniej niż 5 znaków.", 4000);
			if(language == "turk") Materialize.toast("Promosyon kodu olabilir az 5 karakter.", 4000);
			if(language == "ch") Materialize.toast("促销代码可以不少于5个字符。", 4000);
			return;
		}
		if(code.length > 20) {
			if(language == "rus") Materialize.toast("Промо-код не может быть больше 20 символов.", 4000);
			if(language == "eng") Materialize.toast("Promo code can not be more than 20 characters.", 4000);
			if(language == "de") Materialize.toast("Promo-Code kann nicht größer sein als 20 Zeichen.", 4000);
			if(language == "pl") Materialize.toast("Kod promocyjny nie może być większa niż 20 znaków.", 4000);
			if(language == "turk") Materialize.toast("Promosyon kodu en fazla 20 karakter.", 4000);
			if(language == "ch") Materialize.toast("促销代码不能超过20人物。", 4000);
			return;
		}
		if(cyrillicPattern.test(code)) {
			Materialize.toast(translator.get('Введите корректный промо-код.'), 4000);
			return;
		}
		$("#promo-submit").css("display", "none");
		$("#promo-loader").css("opacity", "1");
		$("#promo-loader").css("display", "inline-block");
		setTimeout(function() {
			$("#promo-loader").animate({opacity: 0}, 1000, function() {
				$("#promo-submit").css("display", "inline-block");
				$("#promo-loader").css("display", "none");
			});
		}, 1000);

		socket.emit('enter_promocode', {
			steamid: steamid,
			salt: salt,
			promo: code
		});
	});

	$("#referral-my-submit").click(function() {
		var code = $("#referral-my-input").val();
		if(code.length < 5) {
			if(language == "rus") Materialize.toast("Реферальный код не может быть меньше 5 символов.", 4000);
			if(language == "eng") Materialize.toast("The referral code cannot be less than 5 characters.", 4000);
			if(language == "de") Materialize.toast("Die Kennung kann nicht weniger als 5 Zeichen lang sein.", 4000);
			if(language == "pl") Materialize.toast("Kod polecający nie może być mniejsza niż 5 znaków.", 4000);
			if(language == "turk") Materialize.toast("Başvuru kodu olabilir az 5 karakter.", 4000);
			if(language == "ch") Materialize.toast("推介的代码不能少于5人物。", 4000);
			return;
		}
		if(code.length > 10) {
			if(language == "rus") Materialize.toast("Реферальный код не может быть больше 10 символов.", 4000);
			if(language == "eng") Materialize.toast("The referral code cannot be more than 10 characters.", 4000);
			if(language == "de") Materialize.toast("Die Kennung kann nicht größer sein als 10 Zeichen.", 4000);
			if(language == "pl") Materialize.toast("Kod polecający nie może być więcej niż 10 znaków.", 4000);
			if(language == "turk") Materialize.toast("Başvuru kodu en fazla 10 karakter.", 4000);
			if(language == "ch") Materialize.toast("推介的代码不能超过10字符。", 4000);
			return;
		}
		if(cyrillicPattern.test(code)) {
			Materialize.toast(translator.get('Введите корректный реферальный код.'), 4000);
			return;
		}
		$("#referral-my-submit").css("display", "none");
		$("#referral-my-loader").css("opacity", "1");
		$("#referral-my-loader").css("display", "inline-block");
		setTimeout(function() {
			$("#referral-my-loader").animate({opacity: 0}, 1000, function() {
				$("#referral-my-submit").css("display", "inline-block");
				$("#referral-my-loader").css("display", "none");
			});
		}, 1000);

		socket.emit('refresh_refcode', {
			steamid: steamid,
			salt: salt,
			refcode: code
		});
	});

	$("#referral-claim-submit").click(function() {
		socket.emit('claim_receive', {
			steamid: steamid,
			salt: salt
		});
		$("#referral-claim-submit").css("display", "none");
		$("#referral-claim-loader").css("opacity", 1);
		$("#referral-claim-loader").css("display", "inline-block");
	});

	$("#reward-claim-submit").click(function() {
		socket.emit('daily_receive', {
			steamid: steamid,
			salt: salt
		});
		$("#reward-claim-submit").css("display", "none")
		$("#reward-claim-loader").css("opacity", 1);;
		$("#reward-claim-loader").css("display", "inline-block");
	});

	$("#past-queue").scroll(function() {
		var l = $("#past-queue-wrapper .past-tooltip").length;
		var c = $("#past-queue").scrollTop();
		var h = $("#past-queue").height();
		var h2 = $("#past-queue-wrapper").height();
		var z = c + h;
		if((z+20) < h2) {
			$("#past-queue-more").css("display", "block");
		} else {
			$("#past-queue-more").css("display", "none");
		}
	});

	var menuItems = ["#nav-game", "#nav-profile", "#nav-inventory", "#nav-shop", "#nav-rewards", "#nav-faq"]
	var gamePages = ["#content-game", "#content-profile", "#content-inventory", "#content-shop", "#content-rewards", "#content-faq"]
	for(var i=0; i<menuItems.length; i++) {
		$(menuItems[i]).click(function() {
			var page = '';
			for(var o=0; o<menuItems.length; o++) {
				$(menuItems[o]).removeClass("nav-element-active");
				$(menuItems[o]).removeClass("nav-element");
				$(menuItems[o]).addClass("nav-element");
				$(this).addClass("nav-element-active");
				var t = $(this).position().top;
				$('#nav-border').stop().animate({"top": t+"px"}, 150);
				var m = ($(this).attr('id')).split("-");
				page = m[1]
			}
			for(var k=0; k<gamePages.length; k++) {
				$(gamePages[k]).css("display", "none");
			}
			$("#content-"+page).css("display", "block")
		});
	}

    socket = io(':2096', {reconnection:true,reconnectionDelay:3000,reconnectionAttempts:20,forceNew:true});

    steamid = $('#steamid').val();
    salt = $('#salt').val();
    socket.on('connect', function(data) {
        log('connected', 1);
        log('auth', 2);
        connected = true;
        if (steamid != 1) {
            socket.emit('security_check', {
                steamid: steamid,
                salt: salt
            });
        } else {}
    });

    socket.on('security_success', function() {
		log('auth success', 3);
    });

    socket.on('security_error', function() {
        log('auth fail', 3);
		if(language == "rus") Materialize.toast("Ваш токен авторизации устарел, обновите страницу.", 4000);
		if(language == "eng") Materialize.toast("Your authorization token is out of date, refresh the page.", 4000);
		if(language == "de") Materialize.toast("Ihre Autorisierungs-Token veraltet ist, aktualisieren Sie die Seite.", 4000);
		if(language == "pl") Materialize.toast("Twój token autoryzacji jest nieaktualny, odśwież stronę.", 4000);
		if(language == "turk") Materialize.toast("Senin belirteci yetkilendirme güncel sayfayı yenileyin.", 4000);
		if(language == "ch") Materialize.toast("你的授权令牌出的日期、刷新网页。", 4000);
    });

    socket.on('err_limit', function(data) {
        log('error limit', 3);
    });

    socket.on('refcode_activated', function(data) {
		Materialize.toast(data.text);
    });

    socket.on('settings_save_success', function() {
        log('saved', 2);
		if(language == "rus") Materialize.toast("Ссылка на обмен сохранена.", 4000);
		if(language == "eng") Materialize.toast("Trade link is saved.", 4000);
		if(language == "de") Materialize.toast("Verbindung zur Vermittlungsstelle gespeichert.", 4000);
		if(language == "pl") Materialize.toast("Link do wymiany zachowana.", 4000);
		if(language == "turk") Materialize.toast("Link değişimi kaydedilir.", 4000);
		if(language == "ch") Materialize.toast("链接交换是保存。", 4000);
    });

    socket.on('tradelink', function(data) {
        log('tradelink ' + data.tradelink, 1);
        tradelink = data.tradelink;
        if (pagetags.indexOf(1) > -1 && data.tradelink && data.tradelink != 'notset') {
            $('#trade-url-input').val(data.tradelink);
        }
        if ((pagetags.indexOf(1) > -1) && data.tradelink && data.tradelink == 'notset' && currentpage != 'profile') {
        }
    });

	socket.on('err_client', function(data) {
        log('error ' + errors[data.code] + '(' + data.code + ')', 2)

		if(data.text == "Please, sign in through Steam!") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "Недостаточно Bux на балансе.") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "Нельзя активировать свой реферальный код.") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "You already enter the referal code!") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "Реферальный код не может быть меньше 5 и больше 10 символов") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "SteamID не найден.") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "Промо-код уже активирован.") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "Промо-код не найден.") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "Deposit is currently disabled.") {
			setTimeout(function() { Materialize.toast(translator.get(data.text), 4000); }, 3000);
			return;
		}

		if(data.text == "We dont have any free bots to server your tradeoffer. Try again in a few minutes.") {
			setTimeout(function() { Materialize.toast(translator.get(data.text), 4000); }, 3000);
			return;
		}

		if(data.text == "ТЕКСТ ОШИБКИ") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "Draw has already started, please wait...") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "Max of 4 bets on roulette.") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "Amount can't be less a 10") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.code == 57) {
			Materialize.toast(translator.get("Ваш баланс заморожен."), 4000);
			return;
		}
        if (data.code == 55) {
            setTimeout(function() {Materialize.toast(data.withdraw_text[language] + "<br>" + translator.get("Ваш депозит:") + data.doptext + " Bux.", 10000);}, 1000);
            $('.spinner').remove();
            $('.inventory_attempt').css('width', '500px');
            $('.inventory_attempt').html(data.text);
            return;
        } else {
			Materialize.toast(data.text);
		}
    });

    socket.on('deposit_success_client', function(data) {
        log('items', 3);

		itemsselected_steam = [];
		$("#inventory-checkout").html("");
		$("#inventory-checkout-amount").text("0");

        if(language == "rus") Materialize.toast("Предметы получены, на баланс зачислено "+data.fullprice+" Bux.", 4000);
		if(language == "eng") Materialize.toast("Items received, the balance credited "+data.fullprice+" Bux.", 4000);
		if(language == "de") Materialize.toast("Gegenstände bezogen, auf die Bilanz eingeschrieben "+data.fullprice+" Bux.", 4000);
		if(language == "pl") Materialize.toast("Przedmioty uzyskane na równowagę zapisuje się "+data.fullprice+" Bux.", 4000);
		if(language == "turk") Materialize.toast("Alınan öğeleri, bakiye alacak için "+data.fullprice+" Bux.", 4000);
		if(language == "ch") Materialize.toast("收到的项目、平衡记"+data.fullprice+" Bux.", 4000);
    });
	var icons = {
		'grey' : 'x2',
		'red' : 'x3',
		'blue' : 'x5',
		'gold' : 'x50'
	};
    socket.on('deposit_bot_success_client', function(data) {
        log('deposit bot ' + data.bot, 1);
    });

    socket.on('wtf_alert', function(data) {
        toastr.clear();

		itemsselected_steam = [];
		$("#inventory-checkout").html("");
		$("#inventory-checkout-amount").text("0");
		sumselect_steam = 0;
    });

    socket.on('wtf_alert2', function(data) {
        toastr.clear();
    });

    socket.on('deposit_sent_success_client', function(data) {
        log('deposit offer ' + data.tradeoffer, 2);
        log('code ' + data.security + ' bot ' + data.bot, 2);
        tradeoffer[data.tradeoffer] = setInterval(function() {
            var timeleft = Number($('#' + data.tradeofferid + '-timeleft').html());
            timeleft--;
            if (timeleft == 0) {
                clearInterval(tradeoffer[data.tradeoffer]);
				toastr.clear();
            }
            $('#' + data.tradeofferid + '-timeleft').html(timeleft);
        }, 1000);
		toastr.options = {
			"extendedTimeOut": "180000",
			"timeOut": "180000"
		};
        if(language == "rus") Materialize.toast($('<span>Наш бот ' + data.usernick + ' отправил вам обмен, код подтверждения: ' + data.rndtoken + '.<br><a style="font-weight: 800; color: rgb(248,191,96);" href="http://steamcommunity.com/tradeoffer/' + data.tradeofferid + '" target="_blank">Принять обмен (<span id="' + data.tradeofferid + '-timeleft">180</span>)</a></span>'), 12000);
		if(language == "eng") Materialize.toast($('<span>Our bot ' + data.usernick + ' sent you the trade confirmation code: ' + data.rndtoken + '.<br><a style="font-weight: 800; color: rgb(248,191,96);" href="http://steamcommunity.com/tradeoffer/' + data.tradeofferid + '" target="_blank">Accept trade offer (<span id="' + data.tradeofferid + '-timeleft">180</span>)</a></span>'), 12000);
		if(language == "de") Materialize.toast($('<span>Unser bot ' + data.usernick + ' hat Ihnen der austausch, bestätigungscode: ' + data.rndtoken + '.<br><a style="font-weight: 800; color: rgb(248,191,96);" href="http://steamcommunity.com/tradeoffer/' + data.tradeofferid + '" target="_blank">Das Angebot annehmen (<span id="' + data.tradeofferid + '-timeleft">180</span>)</a></span>'), 12000);
		if(language == "pl") Materialize.toast($('<span>Nasz bot ' + data.usernick + ' wysłałem ci wymiana, kod potwierdzający: ' + data.rndtoken + '.<br><a style="font-weight: 800; color: rgb(248,191,96);" href="http://steamcommunity.com/tradeoffer/' + data.tradeofferid + '" target="_blank">Przyjąć ofertę (<span id="' + data.tradeofferid + '-timeleft">180</span>)</a></span>'), 12000);
		if(language == "turk") Materialize.toast($('<span>Bizim bot ' + data.usernick + ' size gönderilen döviz, onay kodu: ' + data.rndtoken + '.<br><a style="font-weight: 800; color: rgb(248,191,96);" href="http://steamcommunity.com/tradeoffer/' + data.tradeofferid + '" target="_blank">Teklifi kabul (<span id="' + data.tradeofferid + '-timeleft">180</span>)</a></span>'), 12000);
		if(language == "ch") Materialize.toast($('<span>我们的机器人' + data.usernick + '送你一个交换确认代码: ' + data.rndtoken + '.<br><a style="font-weight: 800; color: rgb(248,191,96);" href="http://steamcommunity.com/tradeoffer/' + data.tradeofferid + '" target="_blank">接受这项提议(<span id="' + data.tradeofferid + '-timeleft">180</span>)</a></span>'), 12000);

		toastr.options = {
			"extendedTimeOut": "5000",
			"timeOut": "5000"
		};
    });

    socket.on('players_online', function(data) {
        log('online ' + data, 5);
        $('users-online').text(data);
    });

    socket.on('claim_info', function(data) {

			if(language == "rus") Materialize.toast("Вы получили награду в размере " + data.reward + " Bux.", 4000);
			if(language == "eng") Materialize.toast("You got a reward in the amount of " + data.reward + " Bux.", 4000);
			if(language == "de") Materialize.toast("Sie erhalten eine Prämie in Höhe von " + data.reward + " Bux.", 4000);
			if(language == "pl") Materialize.toast("Otrzymał nagrodę w wysokości " + data.reward + " Bux.", 4000);
			if(language == "turk") Materialize.toast("Aldığınız ödül miktarı " + data.reward + " Bux.", 4000);
			if(language == "ch") Materialize.toast("你得到了奖励数额的" + data.reward + " Bux.", 4000);

		if(data.t) {
			$("#referral-claim-level").html('<img id="referral-level-icon" src="/static/images/'+icons[site_color]+'.png">'+data.claim+' <span data-trn-key="получить" class="trn">'+translator.get("получить")+'</span>');
			$("#referral-claim-loader").animate({opacity: 0}, 1000, function() {
				$("#referral-claim-submit-disabled").css("display", "inline-block");
				$("#referral-claim-loader").css("display", "none");
			});
		} else {
			$("#referral-claim-loader").animate({opacity: 0}, 1000, function() {
				$("#referral-claim-submit").css("display", "inline-block");
				$("#referral-claim-loader").css("display", "none");
			});
		}
    });

	socket.on('claim', function(data) {
		$("#referral-claim-level").html('<img id="referral-level-icon" src="/static/images/'+icons[site_color]+'.png">'+data.claim+' <span data-trn-key="получить" class="trn">'+translator.get("получить")+'</span>');
		if(data.claim == 0) {
			$("#referral-claim-submit").css('display', 'none');
			$("#referral-claim-submit-disabled").css('display', 'inline-block');
		}
	});

    socket.on('daily_info', function(data) {

			if(language == "rus") Materialize.toast("Вы получили награду в размере " + data.reward + " Bux.", 4000);
			if(language == "eng") Materialize.toast("You got a reward in the amount of " + data.reward + " Bux.", 4000);
			if(language == "de") Materialize.toast("Sie erhalten eine Prämie in Höhe von " + data.reward + " Bux.", 4000);
			if(language == "pl") Materialize.toast("Otrzymał nagrodę w wysokości " + data.reward + " Bux.", 4000);
			if(language == "turk") Materialize.toast("Aldığınız ödül miktarı " + data.reward + " Bux.", 4000);
			if(language == "ch") Materialize.toast("你得到了奖励数额的" + data.reward + " Bux.", 4000);

		if(data.t) {
			$("#reward-claim-loader").animate({opacity: 0}, 1000, function() {
				$("#reward-claim-submit-disabled").css("display", "inline-block");
				$("#reward-claim-loader").css("display", "none");
			});
			dailyTime = getUnixTime();
			dailyIntervalTimer();
		} else {
			$("#reward-claim-loader").animate({opacity: 0}, 1000, function() {
				$("#reward-claim-submit").css("display", "inline-block");
				$("#reward-claim-loader").css("display", "none");
			});
		}
    });

    socket.on('inventory_steam_dota2', function(data) {
        log('steam inventory', 2);
        if (pagetags.indexOf(3) > -1) {
            var counter = 0;

			itemsselected_steam = [];
			$("#inventory-checkout").html("");
			$("#inventory").html('');
			$("#inventory-checkout-amount").text("0");

			depositPages = 0;
			depositCurrentPage = 0;
			depositContainer = [{page: 1, content: []}];
			cacheItems2 = [];

			if(language == "rus") setTimeout(function() { Materialize.toast("Инвентарь Dota 2 обновлен.", 4000); } , 300);
			if(language == "eng") setTimeout(function() { Materialize.toast("Inventory Dota 2 updated.", 4000); } , 300);
			if(language == "de") setTimeout(function() { Materialize.toast("Inventar Dota 2 aktualisiert.", 4000); } , 300);
			if(language == "pl") setTimeout(function() { Materialize.toast("Inwentarz Dota 2 zaktualizowany.", 4000); } , 300);
			if(language == "turk") setTimeout(function() { Materialize.toast("Stok Dota 2 güncellendi.", 4000); } , 300);
			if(language == "ch") setTimeout(function() { Materialize.toast("该清单被更新 Dota 2。", 4000); } , 300);

            var itemsstring = '';
			depositItems = [];
			for(key in data.items) depositItems.push(data.items[key]);
			depositItems.sort(function(obj1, obj2){
				return parseFloat(obj1.price) - parseFloat(obj2.price);
			})

            for (var key = depositItems.length - 1; key >= 0; key--) {
                var item = depositItems[key];
                deposit_cacheItems.push(item);
				if(counter == 0) {
					depositPages++;
					$("#inventory").append('<div id="d-page" class="deposit-page-'+depositPages+'"></div>');
				}
                counter++;
                if (item.color == 0) item.color = 'D32CE6';
				if(counter == 22) {
					depositPages++;
					$("#inventory").append('<div id="d-page" class="deposit-page-'+depositPages+'"></div>');
					counter = 1;
				}

				if(!depositContainer[depositPages]) {
					depositContainer.push({page : depositPages, content : [renderContainerItemInventory_dota2(item.assetid, item.market_hash_name, item.img, item.price, 'bot', item.bot, item.wear, item.id)]});
				} else {
					depositContainer[depositPages].content.push(renderContainerItemInventory_dota2(item.assetid, item.market_hash_name, item.img, item.price, 'bot', item.bot, item.wear, item.id));
				}
            }


			$("#inventory-loader-dota2").animate({opacity: 0}, 1000, function() {
				$("#inventory-refresh-dota2").css("display", "inline-block");
				$("#inventory-loader-dota2").css("display", "none");
			});
            if(counter > 0){
                $("#inventory-empty").css("display", "block");
				$(".inventory_refresh_view").css("display", "none");
            } else {
				$("#inventory-empty").css("display", "block");
				$(".inventory_refresh_view").css("display", "block").html('<span class="trn" data-trn-key="Ваш инвентарь пуст.">' + translator.get("Ваш инвентарь пуст.") + "</span>");
				return;
			}
			$(".deposit-previous").each(function() {
				$(this).css("display", "inline-block");
			});
			$(".deposit-next").each(function() {
				$(this).css("display", "inline-block");
			});

			if(depositPages == 1) {
				$(".deposit-previous").each(function() {
					$(this).css("display", "none");
				});
				$(".deposit-next").each(function() {
					$(this).css("display", "none");
				});
			}

			if(counter > 0) setDepositPage(1);


			invCache = getUnixTime();

        }
    });

    socket.on('inventory_steam_csgo', function(data) {
        log('steam inventory', 2);
        if (pagetags.indexOf(3) > -1) {
            var counter = 0;

			itemsselected_steam = [];
			$("#inventory-checkout").html("");
			$("#inventory").html('');
			$("#inventory-checkout-amount").text("0");

			depositPages = 0;
			depositCurrentPage = 0;
			depositContainer = [{page: 1, content: []}];
			cacheItems2 = [];

			if(language == "rus") setTimeout(function() { Materialize.toast("Инвентарь CS:GO обновлен.", 4000); } , 300);
			if(language == "eng") setTimeout(function() { Materialize.toast("Inventory CS:GO updated.", 4000); } , 300);
			if(language == "de") setTimeout(function() { Materialize.toast("Inventar CS:GO aktualisiert.", 4000); } , 300);
			if(language == "pl") setTimeout(function() { Materialize.toast("Inwentarz CS:GO zaktualizowany.", 4000); } , 300);
			if(language == "turk") setTimeout(function() { Materialize.toast("Stok CS:GO güncellendi.", 4000); } , 300);
			if(language == "ch") setTimeout(function() { Materialize.toast("该清单被更新 CS:GO。", 4000); } , 300);

            var itemsstring = '';
			depositItems = [];
			for(key in data.items) depositItems.push(data.items[key]);
			depositItems.sort(function(obj1, obj2){
				return parseFloat(obj1.price) - parseFloat(obj2.price);
			})

            for (var key = depositItems.length - 1; key >= 0; key--) {
                var item = depositItems[key];
                deposit_cacheItems.push(item);
				if(counter == 0) {
					depositPages++;
					$("#inventory").append('<div id="d-page" class="deposit-page-'+depositPages+'"></div>');
				}
                counter++;
                if (item.color == 0) item.color = 'D32CE6';
				if(counter == 22) {
					depositPages++;
					$("#inventory").append('<div id="d-page" class="deposit-page-'+depositPages+'"></div>');
					counter = 1;
				}

				if(!depositContainer[depositPages]) {
					depositContainer.push({page : depositPages, content : [renderContainerItemInventory_csgo(item.assetid, item.market_hash_name, item.img, item.price, 'bot', item.bot, item.wear, item.id)]});
				} else {
					depositContainer[depositPages].content.push(renderContainerItemInventory_csgo(item.assetid, item.market_hash_name, item.img, item.price, 'bot', item.bot, item.wear, item.id));
				}
            }


			$("#inventory-loader-csgo").animate({opacity: 0}, 1000, function() {
				$("#inventory-refresh-csgo").css("display", "inline-block");
				$("#inventory-loader-csgo").css("display", "none");
			});
            if(counter > 0){
                $("#inventory-empty").css("display", "block");
				$(".inventory_refresh_view").css("display", "none");
            } else {
				$("#inventory-empty").css("display", "block");
				$(".inventory_refresh_view").css("display", "block").html('<span class="trn" data-trn-key="Ваш инвентарь пуст.">' + translator.get("Ваш инвентарь пуст.") + "</span>");
				return;
			}
			$(".deposit-previous").each(function() {
				$(this).css("display", "inline-block");
			});
			$(".deposit-next").each(function() {
				$(this).css("display", "inline-block");
			});

			if(depositPages == 1) {
				$(".deposit-previous").each(function() {
					$(this).css("display", "none");
				});
				$(".deposit-next").each(function() {
					$(this).css("display", "none");
				});
			}

			if(counter > 0) setDepositPage(1);


			invCache = getUnixTime();

        }
    });

	function compare(a,b) {
		if (a.real_price > b.real_price) return -1;
		if (a.real_price < b.real_price) return 1;
		return 0;
	}
    socket.on('inventory_website_csgo', function(data) {
		setTimeout(function() {
        log('website inventory', 2);
        if (pagetags.indexOf(3) > -1) {

			itemsselected_inventory = [];
			$("#shop-checkout").html("");
			$("#shop").html("");
			$("#shop-checkout-amount").text("0");

			withdrawPages = 1;
			withdrawCurrentPage = 0;
			withdrawContainer = [{page: 1, content: []}];
			cacheItems = [];

			if(language == "rus") Materialize.toast("Магазин CS:GO обновлен.", 4000);
			if(language == "eng") Materialize.toast("Shop CS:GO updated.", 4000);
			if(language == "de") Materialize.toast("Shop CS:GO aktualisiert.", 4000);
			if(language == "pl") Materialize.toast("Sklep CS:GO zaktualizowany.", 4000);
			if(language == "turk") Materialize.toast("Dükkanı CS:GOgüncellendi.", 4000);
			if(language == "ch") Materialize.toast("商店被更新 CS:GO。", 4000);
            var counter = 0;
            var itemsstring = '';
            var bots = {};
            var limit = 40;
            for (var key in data.items) {
                var item = data.items[key];
                withdraw_cacheItems.push(item);
                counter++;
                if (item.color == 0) item.color = 'D32CE6';
				if(counter == 22) {
					$("#shop").append('<div id="w-page" class="withdraw-page-'+withdrawPages+'"></div>');
					withdrawPages++;
					counter = 1;
				}

				if(!withdrawContainer[withdrawPages]) {
					withdrawContainer.push({page : withdrawPages, content : [renderContainerItemCsgo(item.assetid, item.market_hash_name, item.img, item.real_price, 'bot', item.bot, item.wear, item.id)]});
				} else {
					withdrawContainer[withdrawPages].content.push(renderContainerItemCsgo(item.assetid, item.market_hash_name, item.img, item.real_price, 'bot', item.bot, item.wear, item.id));
				}
            }

			$(".shop-previous").each(function() {
				$(this).css("display", "inline-block");
			});
			$(".shop-next").each(function() {
				$(this).css("display", "inline-block");
			});

			if(withdrawPages == 1) {
				$(".shop-previous").each(function() {
					$(this).css("display", "none");
				});
				$(".shop-next").each(function() {
					$(this).css("display", "none");
				});
			}

				$("#shop-loader-csgo").animate({opacity: 0}, 50, function() {
					$("#shop-loader-csgo").css("display", "none");
					$("#shop-empty").css("display", "none");
					$("#shop-refresh-csgo").css("display", "inline-block");
				});

			setWithdrawPage(1);

			$('.shop-item-wrapper').sort(function (a, b) {
				var contentA = Number($(a).attr('data-price'));
				var contentB = Number($(b).attr('data-price'));
				return (contentA > contentB) ? -1 : (contentA < contentB) ? 1 : 0;
			}).appendTo('.withdraw-page-1');
        }
		}, 800);
    });

        socket.on('inventory_website_dota2', function(data) {
		setTimeout(function() {
        log('website inventory', 2);
        if (pagetags.indexOf(3) > -1) {

			itemsselected_inventory = [];
			$("#shop-checkout").html("");
			$("#shop").html("");
			$("#shop-checkout-amount").text("0");

			withdrawPages = 1;
			withdrawCurrentPage = 0;
			withdrawContainer = [{page: 1, content: []}];
			cacheItems = [];

			if(language == "rus") Materialize.toast("Магазин Dota 2 обновлен.", 4000);
			if(language == "eng") Materialize.toast("Shop Dota 2 updated.", 4000);
			if(language == "de") Materialize.toast("Shop Dota 2 aktualisiert.", 4000);
			if(language == "pl") Materialize.toast("Sklep Dota 2 zaktualizowany.", 4000);
			if(language == "turk") Materialize.toast("Dükkanı Dota 2 güncellendi.", 4000);
			if(language == "ch") Materialize.toast("商店被更新 Dota 2。", 4000);
            var counter = 0;
            var itemsstring = '';
            var bots = {};
            var limit = 40;
            for (var key in data.items) {
                var item = data.items[key];
                withdraw_cacheItems.push(item);
                counter++;
                if (item.color == 0) item.color = 'D32CE6';
				if(counter == 22) {
					$("#shop").append('<div id="w-page" class="withdraw-page-'+withdrawPages+'"></div>');
					withdrawPages++;
					counter = 1;
				}

				if(!withdrawContainer[withdrawPages]) {
					withdrawContainer.push({page : withdrawPages, content : [renderContainerItemDota2(item.assetid, item.market_hash_name, item.img, item.real_price, 'bot', item.bot, item.wear, item.id)]});
				} else {
					withdrawContainer[withdrawPages].content.push(renderContainerItemDota2(item.assetid, item.market_hash_name, item.img, item.real_price, 'bot', item.bot, item.wear, item.id));
				}
            }

			$(".shop-previous").each(function() {
				$(this).css("display", "inline-block");
			});
			$(".shop-next").each(function() {
				$(this).css("display", "inline-block");
			});

			if(withdrawPages == 1) {
				$(".shop-previous").each(function() {
					$(this).css("display", "none");
				});
				$(".shop-next").each(function() {
					$(this).css("display", "none");
				});
			}

				$("#shop-loader-dota2").animate({opacity: 0}, 50, function() {
					$("#shop-loader-dota2").css("display", "none");
					$("#shop-empty").css("display", "none");
					$("#shop-refresh-dota2").css("display", "inline-block");
				});

			setWithdrawPage(1);

			$('.shop-item-wrapper').sort(function (a, b) {
				var contentA = Number($(a).attr('data-price'));
				var contentB = Number($(b).attr('data-price'));
				return (contentA > contentB) ? -1 : (contentA < contentB) ? 1 : 0;
			}).appendTo('.withdraw-page-1');
        }
		}, 800);
    });

    socket.on('chat_message', function(data) {
        if (!chat) return;
        var m = {
			msgid: data.msgid,
            steamid: data.steamid,
            name: data.name,
            img: data.img,
            message: data.message,
            group: data.group,
            channel: data.channel,
			sys: data.sys,
			boturl: data.boturl,
			trn: data.trn
        };
        addMsg(m);
    });
    if(typeof(user_data) !== 'undefined' && user_data.group > 0){
    	socket.on('chat_message_orig', function(data) {
	        if (!chat) return;
	        var m = {
				msgid: data.msgid,
	            steamid: data.steamid,
	            name: data.name,
	            img: data.img,
	            message: data.message,
	            group: data.group,
	            channel: 'orig',
				sys: data.sys,
				boturl: data.boturl,
				trn: data.trn
	        };
	        addMsg(m);
	    });
    }

    socket.on('chat_limit', function(data) {
		setTimeout(function() {
			var mdl = '<div class="message">\
					<div class="message-avatar-wrapper">\
						<img class="message-avatar" src="static/images/avatarsystem-'+site_color+'.png">\
					</div>\
					<div class="message-content-wrapper">\
						<a class="message-author-admin">System</a>\
						<br>\
						<span class="message-content trn" data-trn-key="Будьте вежливы в чате. Никаких ругательств, попрошайничества, спойлеров и спама.">'+translator.get("Будьте вежливы в чате. Никаких ругательств, попрошайничества, спойлеров и спама.")+'</span>\
					</div>\
				</div>';

				$("#chat-eng").append(mdl);
				$("#chat-rus").append(mdl);
				$("#chat-turk").append(mdl);
				$("#chat-sys").append(mdl);
		}, 100);
    });

    socket.on('alert_message', function(data) {
		if(data.text == "В настоящее время все боты заняты, повторите попытку позже.") {
			setTimeout(function() { Materialize.toast(translator.get("В настоящее время все боты заняты, повторите попытку позже."), 4000); }, 3000);
			return;
		}

		if(data.text.indexOf('Вы успешно отправили') > -1) {
			Materialize.toast(translator.get('Вы успешно отправили ') + data.amount + " Bux " + translator.get('игроку')   + " " + data.to + ".", 4000);
			return;
		}

		if(data.text == "Произошла ошибка при отправке обмена.") {
			Materialize.toast(translator.get(data.text)+(typeof(data.err) == 'undefined' ? "":data.err), 4000);
			return;
		}

		if(data.text == "Произошла ошибка, попробуйте обновить инвентарь позже.") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "You received a ") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "Реферальный код активирован.") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "Deposit server is offline.") {
			setTimeout(function() { Materialize.toast(translator.get(data.text), 4000); }, 3000);
			return;
		}

		if(data.text == "Реферальный код не найден.") {
			Materialize.toast(translator.get(data.text), 4000);
			return;
		}

		if(data.text == "Enter the sum.") {
			if(language == "rus") Materialize.toast("Введите сумму.", 4000);
			if(language == "eng") Materialize.toast("Enter the amount of.", 4000);
			if(language == "de") Materialize.toast("Geben Sie den Betrag ein.", 4000);
			if(language == "pl") Materialize.toast("Wprowadź kwotę.", 4000);
			if(language == "turk") Materialize.toast("Bir miktar girin.", 4000);
			if(language == "ch") Materialize.toast("输入量。", 4000);
			return;
		}

		if(data.text == "Sum can not be zero.") {
			if(language == "rus") Materialize.toast("Сумма не может быть нулевой.", 4000);
			if(language == "eng") Materialize.toast("The amount can not be zero.", 4000);
			if(language == "de") Materialize.toast("Der Betrag kann nicht null sein.", 4000);
			if(language == "pl") Materialize.toast("Kwota nie może być zero.", 4000);
			if(language == "turk") Materialize.toast("Miktar sıfır olamaz.", 4000);
			if(language == "ch") Materialize.toast("量不可能是零。", 4000);
			return;
		}

		if(data.text == "You cannot send credits to yourself.") {
			if(language == "rus") Materialize.toast("Вы не можете отправить Bux самому себе.", 4000);
			if(language == "eng") Materialize.toast("You can't send Bux to yourself.", 4000);
			if(language == "de") Materialize.toast("Sie können nicht senden Bux zu sich selbst.", 4000);
			if(language == "pl") Materialize.toast("Nie można wysłać Buchs do siebie.", 4000);
			if(language == "turk") Materialize.toast("Kendine Bux gönderebilirsiniz.", 4000);
			if(language == "ch") Materialize.toast("你不能送Bux给自己。", 4000);
			return;
		}

		if(data.text == "You cannot send credits to yourself.") {
			if(language == "rus") Materialize.toast("Вы не можете отправить Bux самому себе.", 4000);
			if(language == "eng") Materialize.toast("You can't send Bux to yourself.", 4000);
			if(language == "de") Materialize.toast("Sie können nicht senden Bux zu sich selbst.", 4000);
			if(language == "pl") Materialize.toast("Nie można wysłać Buchs do siebie.", 4000);
			if(language == "turk") Materialize.toast("Kendine Bux gönderebilirsiniz.", 4000);
			if(language == "ch") Materialize.toast("你不能送Bux给自己。", 4000);
			return;
		}

		if(data.text == "Промо-код активирован.") {
			if(language == "rus") Materialize.toast("Промо-код активирован.", 4000);
			if(language == "eng") Materialize.toast("Promo code is activated.", 4000);
			if(language == "de") Materialize.toast("Promo-Code aktiviert.", 4000);
			if(language == "pl") Materialize.toast("Kod promocyjny jest aktywny.", 4000);
			if(language == "turk") Materialize.toast("Promo-kodu devrededir.", 4000);
			if(language == "ch") Materialize.toast("促销代码被激活。", 4000);
			return;
		}

		if(data.text == "Реферальный код создан.") {
			if(language == "rus") Materialize.toast("Реферальный код создан.", 4000);
			if(language == "eng") Materialize.toast("Referral code is created.", 4000);
			if(language == "de") Materialize.toast("Referral-Code erstellt.", 4000);
			if(language == "pl") Materialize.toast("Kod polecający stworzony.", 4000);
			if(language == "turk") Materialize.toast("Başvuru kodu oluşturulur.", 4000);
			if(language == "ch") Materialize.toast("介码是创建。", 4000);
			return;
		}

		if(data.text == "Нельзя использовать русские символы.") {
			if(language == "rus") Materialize.toast("Нельзя использовать русские символы.", 4000);
			if(language == "eng") Materialize.toast("You cannot use Russian characters.", 4000);
			if(language == "de") Materialize.toast("Nicht russische Zeichen verwendet werden.", 4000);
			if(language == "pl") Materialize.toast("Nie można używać rosyjskie znaki.", 4000);
			if(language == "turk") Materialize.toast("Kullanamazsınız rus karakterler.", 4000);
			if(language == "ch") Materialize.toast("你不能使用俄罗斯的人物。", 4000);
			return;
		}

		if(data.text == "Реферальный код уже занят.") {
			if(language == "rus") Materialize.toast("Реферальный код уже занят.", 4000);
			if(language == "eng") Materialize.toast("Referral code is already occupied.", 4000);
			if(language == "de") Materialize.toast("Empfehlungs-Code schon belegt.", 4000);
			if(language == "pl") Materialize.toast("Kod polecający jest już zajęty.", 4000);
			if(language == "turk") Materialize.toast("Başvuru kodu zaten kullanımda.", 4000);
			if(language == "ch") Materialize.toast("介码已经被占用。", 4000);
			return;
		}

		if(data.text.indexOf('Предложение об обмене отклонено!') > -1) {
			if(language == "rus") Materialize.toast("Предложение об обмене отклонено. (ID обмена: " +data.tradeofferid+ ")", 4000);
			if(language == "eng") Materialize.toast("The trade offer rejected. (Trade ID: " +data.tradeofferid+ ")", 4000);
			if(language == "de") Materialize.toast("Der Vorschlag über den Austausch abgelehnt. (ID-Austausch: " +data.tradeofferid+ ")", 4000);
			if(language == "pl") Materialize.toast("Wniosek o wymianę odrzucona. (ID wymiany: " +data.tradeofferid+ ")", 4000);
			if(language == "turk") Materialize.toast("Teklif ile ilgili değişim reddedildi. (ID paylaşım: " +data.tradeofferid+ ")", 4000);
			if(language == "ch") Materialize.toast("交换拒绝。 (ID: " +data.tradeofferid+ ")", 4000);
			return;
		}

		if(data.type == "error") {
			Materialize.toast(data.text, 4000);
		} else {
			Materialize.toast(data.text, 4000);
		}

    });

    socket.on('double_bet', function(data) {
        doubleBet(data.color, data.user.steamid, data.bet, data.user.img, data.user.name, data.boturl);
    });

    socket.on('last_color', function(data) {
		var rc = [];
		for(var key in rollColors) {
			if(!rollColors[key]) return;
			if(rollColors[key] == data.lastColor) rc.push(key);
		}

		var num = rc[0];
		var p = 360 / 54 * Number(num) + 1080 - 2;
		var c = rollColors[num];
		if(c == "grey") c = "rgb(45,50,73)";
		if(c == "red") c = "rgb(208,51,82)";
		if(c == "blue") c = "rgb(26,169,201)";
		if(c == "gold") c = "rgb(248, 191, 96)";
		$("#wheel-pointer").css({color: c});
		$("#wheel-timer").css({color: c});
		$("#content-wheel-canvas").css('-webkit-transform','rotate('+p+'deg)');
    });

    socket.on('double_timeleft', function(data) {
        rouletteCountdown(data.timeleft);
    });

    socket.on('double_hash', function(data) {
        setHash(data.hash);
    });

	socket.on('double_new', function(data) {
		rouletteNextGame(0);
	});

	socket.on('double_history', function(data) {
		$("#past-queue-wrapper").html("");
		data.row.reverse();
		for(var i=0; i<10; i++) {
			if(!data.row[i]) return;

			var numbers = {
				'grey' : 0,
				'red' : 1,
				'blue' : 2,
				'gold' : 3
			}
			var model = '<div class="past-'+numbers[data.row[i].color]+' past-tooltip">\
							<div class="past-color"></div>\
							<div class="past-queue-tooltip tooltip-'+numbers[data.row[i].color]+'" style="left: -111px; top: '+(17 + 9 * (30-i))+'px; display: none;"><span>Hash</span>\
								<br>'+data.row[i].hash+'\
								<br><span>Salt</span>\
								<br>'+data.row[i].salt+'\
								<br><span>Random</span>\
								<br>'+data.row[i].random+'</div>\
						</div>';

			$("#past-queue-wrapper").prepend(model);
		}
		$('#past-queue').scrollTop(99999);
		$("#past-queue-more").css("display", "none");
    });

    socket.on('lastbets', function(data) {
        refreshLastBets(data);
    });

    socket.on('lastsends', function(data) {
        refreshLastSends(data);
    });

    socket.on('lastoperations', function(data) {
        lastUserOperations(data);
    });

    socket.on('double_winner', function(data) {
        doubleRoll(data.color, 0, data.last);
        startCountdownRoulette();
    });

    socket.on('players_online', function(online) {
        var options = {
			useEasing : false,
			useGrouping : true,
			separator : ''
		};
		var demo = new CountUp("online", parseFloat($('#online').text()), online, 0, 1, options);
		demo.start();
    });

    socket.on('refresh_page', function() {
        location.reload(true);
    });

    socket.on("balance", function(data) {
       setBalance(data.balance);
    });

    socket.on("level", function(data) {
       setLevel(data);
    });

    socket.on("withdrawstat", function(data) {
       setWithdrawStat(data);
    });

    socket.on("chat_remove_messages", function(data) {
		$(".message[data-msgid="+data.msgid+"]").each(function() {
			$(this).remove();
		});
    });

    var tradelinkform = document.getElementById('tradelink');
    if (tradelinkform) {
        tradelinkform.onsubmit = function(e) {
            e.preventDefault();
            settings_save();
        };
    }

    var msgform = document.getElementById('message-form');
    if (msgform) {
        msgform.onsubmit = function(e) {
            e.preventDefault();
            sendmessage();
        };
    }

	if($("#steamid").val() == "1") {
		$("#message-form").html('<a id="chat-input-disabled" class="trn" href="/login">'+translator.get("Авторизуйтесь, чтобы использовать чат")+'</a>');
		$("#login-background").animate({opacity: 1}, 1000);

		$('#chat-eng').scrollTop(9999999);
		$('#chat-turk').scrollTop(9999999);
		$('#chat-rus').scrollTop(9999999);
		$('#chat-sys').scrollTop(9999999);
	}

	$("#gotit-btn").click(function() {
		$("#login-background").animate({opacity: 0}, 1000, function() {
			$("#login-background").css("display", "none");
		});
	});

	$("#trade-url-submit").click(function() {
		settings_save();
	});

	$("#send-submit").click(function() {
		send_coins();
	});

	$("#shop-sort").click(function() {
		sortItems();
		$("#shop-sort").css("display", "none");
		$("#shop-sort-loader").css("opacity", "1");
		$("#shop-sort-loader").css("display", "inline-block");
		setTimeout(function() {
			$("#shop-sort-loader").animate({opacity: 0}, 500, function() {
				$("#shop-sort").css("display", "inline-block");
				$("#shop-sort-loader").css("display", "none");
			});
		}, 500);
	});

	$("#shop-filter-0").click(function() {
		$("#shop-filter").text(translator.get("Всё"));
        $("#shop .shop-item-wrapper").show();
        $("#shop .shop-item-wrapper").each(function() {
            if (parseFloat($(this).attr("data-price")) < 0) {
                $(this).show();
            }
        })
	});
	$("#shop-filter-1").click(function() {
		$("#shop-filter").text("0 - 10K");
        $("#shop .shop-item-wrapper").show();
        $("#shop .shop-item-wrapper").each(function() {
			$(this).hide()
            if (parseFloat($(this).attr("data-price")) > 0 && parseFloat($(this).attr("data-price")) < 10000) {
                $(this).show();
            }
        })
	});
	$("#shop-filter-2").click(function() {
		$("#shop-filter").text("10K - 25K");
        $("#shop .shop-item-wrapper").show();
        $("#shop .shop-item-wrapper").each(function() {
			$(this).hide()
            if (parseFloat($(this).attr("data-price")) > 10000 && parseFloat($(this).attr("data-price")) < 25000) {
                $(this).show();
            }
        })
	});
	$("#shop-filter-3").click(function() {
		$("#shop-filter").text("25K - 50K");
        $("#shop .shop-item-wrapper").show();
        $("#shop .shop-item-wrapper").each(function() {
			$(this).hide()
            if (parseFloat($(this).attr("data-price")) > 25000 && parseFloat($(this).attr("data-price")) < 50000) {
                $(this).show();
            }
        })
	});
	$("#shop-filter-4").click(function() {
		$("#shop-filter").text("50K - 100K");
        $("#shop .shop-item-wrapper").show();
        $("#shop .shop-item-wrapper").each(function() {
			$(this).hide()
            if (parseFloat($(this).attr("data-price")) > 50000 && parseFloat($(this).attr("data-price")) < 100000) {
                $(this).show();
            }
        })
	});
	$("#shop-filter-5").click(function() {
		$("#shop-filter").text("100K+");
        $("#shop .shop-item-wrapper").show();
        $("#shop .shop-item-wrapper").each(function() {
			$(this).hide()
            if (parseFloat($(this).attr("data-price")) > 100000) {
                $(this).show();
            }
        })
	});

	dailyIntervalTimer();

    if (getCookie('giveaway')) {
        var cur = Number($('#gausers').text());
        $('#gausers').text(cur + 1);
    }

});

$(document).on("click", ".user-popup-toggle", function() {
	$(".user-popup-toggle").each(function() {
		if(!$(this).parent().find(".user-actions").hasClass("active")) {
			$(this).parent().find(".user-actions").removeClass("active");
			$(this).parent().find(".user-popup-toggle").removeClass("open");
		}
	});
	$(this).parent().find(".user-actions").toggleClass("active");
	$(this).parent().find(".user-popup-toggle").toggleClass("open");
});

$(document).on("click", ".cmd-add-color-user", function() {
	socket.emit('add_color', {
		steamid: steamid,
		salt: salt,
		targetsid: $(this).attr("data-steamid")
	});
	$(this).parent().parent().parent().find(".user-popup-toggle").removeClass('open');
	$(this).parent().parent().removeClass('active');
});

$(document).on("click", ".cmd-remove-color-user", function() {
	socket.emit('remove_color', {
		steamid: steamid,
		salt: salt,
		targetsid: $(this).attr("data-steamid")
	});
	$(this).parent().parent().parent().find(".user-popup-toggle").removeClass('open');
	$(this).parent().parent().removeClass('active');
});

$(document).on("click", ".cmd-remove-msg-user", function() {
	socket.emit('remove_msg', {
		steamid: steamid,
		salt: salt,
		nick: $(this).attr("data-nick"),
		msgid: $(this).attr("data-msgid")
	});
	$(this).removeClass('open');
	$(this).parent().parent().removeClass('active');
});

var dailyTimer;
function dailyIntervalTimer() {
	if(getUnixTime() - dailyTime >= 86400) {
		$("#reward-claim-submit-disabled").css("display", "none");
		$("#reward-claim-submit").css("display", "inline-block");
		$("#nav-notification").css("display", "block");
	} else {
		clearInterval(dailyTimer);
		dailyTimer = setInterval(function() {
			var time = unixToTime((dailyTime+86400) - getUnixTime());
			$("#reward-claim-submit-disabled").text(time);
			$("#nav-notification").css("display", "none");
			if(getUnixTime() - dailyTime >= 86400) dailyIntervalTimer();
		}, 1000);
	}
}

var sorttype = 'asc';
function sortItems(sortex){
	var p = withdrawCurrentPage;
	if(p == 0) p = 1
	if(sorttype == 'desc'){
		$('.shop-item-wrapper').sort(function (a, b) {
			var contentA = Number($(a).attr('data-price'));
			var contentB = Number($(b).attr('data-price'));
			return (contentA > contentB) ? -1 : (contentA < contentB) ? 1 : 0;
		}).appendTo('.withdraw-page-'+p);
		$('#shop-sort').text(translator.get("От низких к высоким"));
		sorttype = "asc";
	} else if(sorttype == 'asc'){
		$('.shop-item-wrapper').sort(function (a, b) {
			var contentA = Number($(a).attr('data-price'));
			var contentB = Number($(b).attr('data-price'));
			return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
		}).appendTo('.withdraw-page-'+p);
		$('#shop-sort').text(translator.get("От высоких к низким"));
		sorttype = "desc";
	}
}

function getUnixTime() {
	return Math.floor(Date.now() / 1000);
}

var options = {
	useEasing : true,
	useGrouping : true,
	separator : ',',
	decimal : '.',
	prefix : '',
	suffix : ''
};

function unixToTime(value) {
	var h = Math.floor(value/60/60);
	var m = Math.floor((value - h*60*60)/60);
	var s = value - m * 60 - h * 60*60;

	if (h < 10) h = '0' + h;
	if (m < 10) m = '0' + m;
	if (s < 10) s = '0' + s;

	return h + ':' + m + ':' + s;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function setWithdrawPage(page) {
	$('div[id^="w-page"]').each(function() {
		$(this).html("");
	});

	for(var i=0; i<withdrawContainer[page].content.length; i++) {

		var aid = $(withdrawContainer[page].content[i]).attr('data-assetid');
		if(contains.call(cacheItems, aid+"")) continue;
		var v = withdrawContainer[page].content[i];
		v = v.replace(">"+$(v).find('.item-link').text(), ">"+translator.get('ОСМОТРЕТЬ'));
		$(".withdraw-page-"+page).append(v);
	}

	if((page+1) >= withdrawPages) {
		$(".shop-next").each(function() {
			$(this).css("display", "none");
		});
	} else {
		$(".shop-next").each(function() {
			$(this).css("display", "inline-block");
		});
	}

	if(page == 1) {
		$(".shop-previous").each(function() {
			$(this).css("display", "none");
		});
	} else {
		$(".shop-previous").each(function() {
			$(this).css("display", "inline-block");
		});
	}

	$('.shop-item-wrapper').sort(function (a, b) {
		var contentA = Number($(a).attr('data-price'));
		var contentB = Number($(b).attr('data-price'));
		return (contentA > contentB) ? -1 : (contentA < contentB) ? 1 : 0;
	}).appendTo('.withdraw-page-'+page);
}

function setDepositPage(page) {
	$('div[id^="d-page"]').each(function() {
		$(this).html("");
	});

	for(var i=0; i<depositContainer[page].content.length; i++) {

		var aid = $(depositContainer[page].content[i]).attr('data-assetid');
		if(contains.call(cacheItems2, aid+"")) continue;
		if(itemsselected_steam.indexOf($(depositContainer[page].content[i]).attr('data-assetid')) != -1) continue;
		$(".deposit-page-"+page).append(depositContainer[page].content[i]);
	}

	if((page+1) > depositPages) {
		$(".deposit-next").each(function() {
			$(this).css("display", "none");
		});
	} else {
		$(".deposit-next").each(function() {
			$(this).css("display", "inline-block");
		});
	}

	if(page == 1) {
		$(".deposit-previous").each(function() {
			$(this).css("display", "none");
		});
	} else {
		$(".deposit-previous").each(function() {
			$(this).css("display", "inline-block");
		});
	}
}

$(document).on('mouseenter', '#language-selector', function() {
	$(this).addClass("open");
});

$(document).on('mouseleave', '#language-selector', function() {
	$('#language-selector').removeClass("open");
});

$(document).on("click", ".lang-selector", function() {
	$('#language-selector').removeClass("open");

	$("#current-language img").attr("src", $(this).find("img").attr("src"));
	language = $(this).attr('class').split(' ')[1];

	$.cookie('lang', language);

	if(language == "rus") { $("#chat-input").attr("placeholder", "Писать здесь"); $(document).prop('title', title + ' - Колесо Фортуны'); }
	if(language == "eng") { $("#chat-input").attr("placeholder", "Chat here"); $(document).prop('title', title + ' - Wheel of Fortune'); }
	if(language == "de") { $("#chat-input").attr("placeholder", "Chatten Sie hier"); $(document).prop('title', title + ' - Schicksalsrad'); }
	if(language == "pl") { $("#chat-input").attr("placeholder", "Chatuj tutaj"); $(document).prop('title', title + ' - Koło Fortuny'); }
	if(language == "turk") { $("#chat-input").attr("placeholder", "Sohbet için ileti gönder"); $(document).prop('title', title + ' - Çarkıfelek'); }
	if(language == "ch") { $("#chat-input").attr("placeholder", "在这里聊天"); $(document).prop('title', title + ' - 财富之轮'); }

	translator.lang(language);

	$("input").each(function() {
		$(this).attr("placeholder", translator.get($(this).attr("data-translated-placeholder")));
	});
});

$(document).on("click", "#chat-tabs .tab", function() {
	$("#chat-tabs .tab").each(function() {
		$(this).removeClass("active");
	})

	$(".chat-tab").each(function() {
		$(this).removeClass("active");
	})

	$(this).addClass("active");
	CHAT_CHANNEL = $(this).find('a').attr("data-channel");
	$("#chat-"+$(this).find('a').attr("data-channel")).addClass("active");

	$.cookie('chat_channel', CHAT_CHANNEL);

	$('#chat-'+$(this).find('a').attr("data-channel")).scrollTop(99999);
});

$(document).ready(function() {
	if($.cookie('chat_channel')) {
		$("#chat-tabs .tab").each(function() {
			$(this).removeClass("active");
		})

		$(".chat-tab").each(function() {
			$(this).removeClass("active");
		})

		var channel = $.cookie('chat_channel');
		$(".channel-select[data-channel='"+channel+"']").parent().addClass("active");
		CHAT_CHANNEL = channel;
		$("#chat-"+channel).addClass("active");
		setTimeout(function() { $('#chat-'+channel).scrollTop(99999); } , 1000);
	}

	if($.cookie('lang')) {
		$("#current-language img").attr("src", $("."+$.cookie('lang')).find("img").attr("src"));
		language = $("."+$.cookie('lang')).attr('class').split(' ')[1];

		if(language == "rus") { $("#chat-input").attr("placeholder", "Писать здесь"); $(document).prop('title', title + ' - Колесо Фортуны'); }
		if(language == "eng") { $("#chat-input").attr("placeholder", "Chat here"); $(document).prop('title', title + ' - Wheel of Fortune'); }
		if(language == "de") { $("#chat-input").attr("placeholder", "Chatten Sie hier"); $(document).prop('title', title + ' - Schicksalsrad'); }
		if(language == "pl") { $("#chat-input").attr("placeholder", "Chatuj tutaj"); $(document).prop('title', title + ' - Koło Fortuny'); }
		if(language == "turk") { $("#chat-input").attr("placeholder", "Sohbet için ileti gönder"); $(document).prop('title', title + ' - Çarkıfelek'); }
		if(language == "ch") { $("#chat-input").attr("placeholder", "在这里聊天"); $(document).prop('title', title + ' - 财富之轮'); }

		translator.lang(language);


		$("input").each(function() {
			$(this).attr("placeholder", translator.get($(this).attr("data-translated-placeholder")));
		});
	} else {
		$("#current-language img").attr("src", $(".eng").find("img").attr("src"));
		language = $(".eng").attr('class').split(' ')[1];

		if(language == "rus") { $("#chat-input").attr("placeholder", "Писать здесь"); $(document).prop('title', title + ' - Колесо Фортуны'); }
		if(language == "eng") { $("#chat-input").attr("placeholder", "Chat here"); $(document).prop('title', title + ' - Wheel of Fortune'); }
		if(language == "de") { $("#chat-input").attr("placeholder", "Chatten Sie hier"); $(document).prop('title', title + ' - Schicksalsrad'); }
		if(language == "pl") { $("#chat-input").attr("placeholder", "Chatuj tutaj"); $(document).prop('title', title + ' - Koło Fortuny'); }
		if(language == "turk") { $("#chat-input").attr("placeholder", "Sohbet için ileti gönder"); $(document).prop('title', title + ' - Çarkıfelek'); }
		if(language == "ch") { $("#chat-input").attr("placeholder", "在这里聊天"); $(document).prop('title', title + ' - 财富之轮'); }

		translator.lang(language);

		$("input").each(function() {
			$(this).attr("placeholder", translator.get($(this).attr("data-translated-placeholder")));
		});
	}
});

$(document).on("mouseenter", ".past-tooltip", function() {
	$(this).find('.past-queue-tooltip').css("top", $(this).position().top+"px");
	$(this).find('.past-queue-tooltip').css("display", "block");
});

$(document).on("mouseleave", ".past-tooltip", function() {
	$(this).find('.past-queue-tooltip').css("display", "none");
});

$(document).on("click", ".shop-next", function() {
	if((withdrawCurrentPage+1) > withdrawPages) return;
	if(withdrawCurrentPage == 0) withdrawCurrentPage = 1;
	withdrawCurrentPage += 1;
	setWithdrawPage(withdrawCurrentPage);

	$(".shop-previous-loader").css("display", "none");

	var b = $(this).parent().find(".shop-next-loader");
	var t = $(this);
	$(t).css("display", "none");
	$(b).css("display", "block");
	$(b).css("opacity", "1");
	$(b).animate({opacity: 0}, 1000, function() {
		$(b).css("display", "none");
	});
	setTimeout(function() {
		if((withdrawCurrentPage+2) <= withdrawPages) $(t).css("display", "inline-block");
	}, 1000);
});

$(document).on("click", ".shop-previous", function() {
	if((withdrawCurrentPage-1) <= 0) return;
	withdrawCurrentPage -= 1;
	setWithdrawPage(withdrawCurrentPage);

	$(".shop-next-loader").css("display", "none");

	var b = $(this).parent().find(".shop-previous-loader");
	var t = $(this);
	$(t).css("display", "none");
	$(b).css("display", "block");
	$(b).css("opacity", "1");
	$(b).animate({opacity: 0}, 1000, function() {
		$(b).css("display", "none");
	});
	setTimeout(function() {
		if((withdrawCurrentPage-1) > 0) $(t).css("display", "inline-block");
	}, 1000);
});

$(document).on("click", ".deposit-next", function() {
	if((depositCurrentPage+1) > depositPages) return;
	if(depositCurrentPage == 0) depositCurrentPage = 1;
	depositCurrentPage += 1;
	setDepositPage(depositCurrentPage);
	var b = $(this).parent().find(".deposit-next-loader");
	var t = $(this);
	$(t).css("display", "none");
	$(b).css("display", "block");
	$(b).css("opacity", "1");
	$(b).animate({opacity: 0}, 1000, function() {
		$(b).css("display", "none");
	});
	setTimeout(function() {
		if((depositCurrentPage+1) <= depositPages) $(t).css("display", "inline-block");
	}, 1000);
});

$(document).on("click", ".deposit-previous", function() {
	if((depositCurrentPage-1) <= 0) return;
	depositCurrentPage -= 1;
	setDepositPage(depositCurrentPage);
	var b = $(this).parent().find(".deposit-previous-loader");
	var t = $(this);
	$(t).css("display", "none");
	$(b).css("display", "block");
	$(b).css("opacity", "1");
	$(b).animate({opacity: 0}, 1000, function() {
		$(b).css("display", "none");
	});
	setTimeout(function() {
		if((depositCurrentPage-1) > 0) $(t).css("display", "inline-block");
	}, 1000);
});

$(document).on("click", "#inventory #d-page > .inventory-item", function() {
	if(itemsselected_steam.length > 4) {
		if(language == "rus") Materialize.toast("Максимум 5 предметов для депозита.", 4000);
		if(language == "eng") Materialize.toast("A maximum of 5 items for Deposit.", 4000);
		if(language == "de") Materialize.toast("Maximal 5 Gegenstände für die Einzahlung.", 4000);
		if(language == "pl") Materialize.toast("Maksymalnie 5 przedmiotów do depozytu.", 4000);
		if(language == "turk") Materialize.toast("En fazla 5 öğeleri için mevduat.", 4000);
		if(language == "ch") Materialize.toast("一个最大的5个项目，对存款。", 4000);
		return
	}
	var fv = $(this).find(".item-price span").text();
	fv = fv.replace(/ /g, "");
	fv = fv.replace(/,/g, "");
	var amount = parseFloat(sumselect_steam + parseFloat(fv));
	var h = new CountUp("inventory-checkout-amount", sumselect_steam, amount, 0, 1, options);
	h.start();
	sumselect_steam = amount;
    var item = $(this).clone();
    $(this).remove();
    $(item).removeClass("inventory-item");
    $(item).addClass("inventory-item-selected");
	$(item).find('.item-image').addClass('item-image-selected').removeClass('item-image');
	$(item).find('.item-price').addClass('item-price-selected').removeClass('item-price');
	$(item).find('.item-name').addClass('item-name-selected').removeClass('item-name');
    $("#inventory-checkout").append(item);
    $('.tooltip').remove();
    itemsselected_steam.push($(this).attr('data-assetid'));
});

$(document).on("click", "#inventory-checkout > .inventory-item-selected", function() {
	var fv = $(this).find(".item-price-selected span").text();
	fv = fv.replace(/ /g, "");
	fv = fv.replace(/,/g, "");
	var amount = parseFloat(sumselect_steam - parseFloat(fv));
	var h = new CountUp("inventory-checkout-amount", sumselect_steam, amount, 0, 1, options);
	h.start();
	sumselect_steam = amount;
    var item = $(this).clone();
    $(this).remove();
	$(item).addClass("inventory-item");
    $(item).removeClass("inventory-item-selected");
	$(item).find('.item-name-selected').removeClass('item-name-selected').addClass('item-name');
	$(item).find('.item-price-selected').removeClass('item-price-selected').addClass('item-price');
	$(item).find('.item-image-selected').removeClass('item-image-selected').addClass('item-image');

    var w = withdrawCurrentPage;
	if(w == 0) w = 1;

    itemsselected_steam.splice(itemsselected_steam.indexOf($(this).attr('data-assetid')), 1);
    if(depositCurrentPage == 0) depositCurrentPage = 1;
	setDepositPage(depositCurrentPage);
});

$(document).on("click", "#shop #w-page > .shop-item-wrapper .shop-item", function() {
	if(itemsselected_inventory.length > 4) {
		if(language == "rus") Materialize.toast("Максимум 5 предметов для вывода.", 4000);
		if(language == "eng") Materialize.toast("A maximum of 5 items for withdraw.", 4000);
		if(language == "de") Materialize.toast("Maximal 5 Gegenstände für die Ausgabe.", 4000);
		if(language == "pl") Materialize.toast("Maksymalnie 5 przedmiotów do wyjścia.", 4000);
		if(language == "turk") Materialize.toast("En fazla 5 ürün çıktı.", 4000);
		if(language == "ch") Materialize.toast("一个最大的5项产出。", 4000);
		return
	}
	var fv = $(this).find(".item-price span").text();
	fv = fv.replace(/ /g, "");
	fv = fv.replace(/,/g, "");
	var amount = parseFloat(sumselect_inventory + parseFloat(fv));
	var h = new CountUp("shop-checkout-amount", sumselect_inventory, amount, 0, 1, options);
	h.start();
	sumselect_inventory = amount;
	var tthis  = $(this).parent();
	var item = $(tthis).clone();
    $(tthis).remove();
	$(item).removeClass("shop-item-wrapper");
    $(item).addClass("shop-item-selected");
    $(item).css("display", "block");
	cacheItems.push($(item).attr("data-assetid"));
	$(item).find('.item-price').addClass('item-price-selected').removeClass('item-price');
	$(item).find('.item-image').addClass('item-image-selected').removeClass('item-image');
	$(item).find('.item-link').css("display", "none");
    $("#shop-checkout").append(item);
    $('.tooltip').remove();
    itemsselected_inventory.push($(this).attr('data-assetid'));
});

$(document).on("click", "#shop-checkout > .shop-item-selected", function() {
	var fv = $(this).find(".item-price-selected span").text();
	fv = fv.replace(/ /g, "");
	fv = fv.replace(/,/g, "");
	var amount = parseFloat(sumselect_inventory - parseFloat(fv));
	var h = new CountUp("shop-checkout-amount", sumselect_inventory, amount, 0, 1, options);
	h.start();
	sumselect_inventory = amount;
    var item = $(this).clone();
    $(this).remove();
	$(item).addClass("shop-item-wrapper");
    $(item).css("display", "inline-block");
	cacheItems.splice(cacheItems.indexOf($(item).attr("data-assetid"), 1));
    $(item).removeClass("shop-item-selected");
	$(item).find('.item-price-selected').addClass('item-price').removeClass('item-price-selected');
	$(item).find('.item-image-selected').addClass('item-image').removeClass('item-image-selected');
	$(item).find('.item-link').css("display", "block");

	var p = withdrawCurrentPage;
	if(p == 0) p = 1


    $('.tooltip').remove();
    itemsselected_inventory.splice(itemsselected_inventory.indexOf($(this).attr('data-assetid')), 1);
    itemsselected_steam.splice(itemsselected_steam.indexOf($(this).attr('data-assetid')), 1);
    if(withdrawCurrentPage == 0) withdrawCurrentPage = 1;
	setWithdrawPage(withdrawCurrentPage);
});

function betDouble(color) {
    if (steamid == 1) {
        log('error steam', 2);
        if(language == "rus") Materialize.toast("Войдите через Steam.", 4000);
		if(language == "eng") Materialize.toast("Sign in through Steam.", 4000);
		if(language == "de") Materialize.toast("Melden Sie sich über Steam.", 4000);
		if(language == "pl") Materialize.toast("Zaloguj się przez Steam.", 4000);
		if(language == "turk") Materialize.toast("Oturum Steam üzerinden.", 4000);
		if(language == "ch") Materialize.toast("标志在通过蒸汽。", 4000);
        return;
    }
    var amount = Number($('#bet-input').val());
    socket.emit('bet_double', {
        steamid: steamid,
        salt: salt,
        amount: amount,
        color: color
    });
}

function rouletteCountdown(countdown) {
	animateRouletteTimer('wheel-timer', countdown, 1)
	if(countdown == 0) {
		$('#content-allbets .col').each(function() {
			$(this).css("opacity", "0.3");
		});
	}
	$("#wheel-timer").css("display", "block");
}

function rouletteNextGame(countdown) {
    if (countdown <= 0) {
		var colors = ["grey","red","blue","gold"]
        for(var i=0; i<colors.length; i++) {
			$("."+colors[i]+"-wrapper").html("");
			$("."+colors[i]+"-bet-total").text("0");
			$("."+colors[i]+"-person-total").text("0");
		}
		var icons = ['2x', '3x', '5x', '50x'];
		cacheDoubleBet = {
			'my-bets-2x' : 0,
			'my-bets-3x' : 0,
			'my-bets-5x' : 0,
			'my-bets-50x' : 0
		}
		cacheAllBet = {
			'all-bets-2x-total' : 0,
			'all-bets-3x-total' : 0,
			'all-bets-5x-total' : 0,
			'all-bets-50x-total' : 0
		}
		currentTotals = {
			"grey": 0,
			"red": 0,
			"blue": 0,
			"gold": 0
		}
        for(var i=0; i<icons.length; i++) {
			$("#my-bets-"+icons[i]+"-wrapper").css("opacity", "0");
			$("#my-bets-"+icons[i]).text("0");
		}
    }
}

function refreshLastBets(data) {
	var color = {
		"rus" : {
			"grey" : "Серый",
			"red" : "Красный",
			"blue" : "Синий",
			"gold" : "Золотой"
		},
		"eng" : {
			"grey" : "Gray",
			"red" : "Red",
			"blue" : "Blue",
			"gold" : "Gold"
		},
		"de" : {
			"grey" : "Grau",
			"red" : "Rot",
			"blue" : "Blau",
			"gold" : "Gold"
		},
		"pl" : {
			"grey" : "Szary",
			"red" : "Czerwony",
			"blue" : "Niebieski",
			"gold" : "Złoty"
		},
		"turk" : {
			"grey" : "Gri",
			"red" : "Kırmızı",
			"blue" : "Mavi",
			"gold" : "Sarı"
		},
		"ch" : {
			"grey" : "灰色",
			"red" : "红色",
			"blue" : "蓝色",
			"gold" : "金色"
		}
	};

	$("#bet-table-body").html("");
	for(var i=0; i<data.rows.length; i++) {
		var k = (data.rows[i].status == 1) ? '+' : '';
		$("#bet-table-body").append('<tr>\
										<td>'+timeConverter(data.rows[i].date)+'</td>\
										<td>'+k+''+data.rows[i].profit+'</td>\
										<td><span class="trn" data-trn-key="'+color["rus"][data.rows[i].color]+'" data-lang="bet_'+data.rows[i].color+'">'+color[language][data.rows[i].color]+'</span></td>\
									</tr>');
	}
	$("#bet-loader").animate({opacity: 0}, 1000, function() {
		$("#bet-loader").css("display", "none");
		$("#bet-refresh").css("display", "inline-block");
	});
}

function refreshLastSends(data) {
	$("#sends-table-body").html("");
	for(var i=0; i<data.rows.length; i++) {
		$("#sends-table-body").append('<tr>\
										<td>'+data.rows[i].to+'</td>\
										<td>'+data.rows[i].sum+'</td>\
										<td>'+timeConverter(data.rows[i].date)+'</td>\
									</tr>');
	}
	$("#sends-loader").animate({opacity: 0}, 1000, function() {
		$("#sends-loader").css("display", "none");
		$("#sends-refresh").css("display", "inline-block");
	});
}

function refreshLastOperations(data) {
	$("#sends-table-body").html("");
	for(var i=0; i<data.rows.length; i++) {
		$("#sends-table-body").append('<tr>\
										<td>'+data.rows[i].to+'</td>\
										<td>'+data.rows[i].sum+'</td>\
										<td>'+timeConverter(data.rows[i].date)+'</td>\
									</tr>');
	}
	$("#sends-loader").animate({opacity: 0}, 1000, function() {
		$("#sends-loader").css("display", "none");
		$("#sends-refresh").css("display", "inline-block");
	});
}

function lastUserOperations(data) {
	$("#transaction-table-body").html("");
	for(var i=0; i<data.length; i++) {
		if(data[i].status == 6) data[i].status = "Отклонено"
		if(data[i].status == 7) data[i].status = "Отклонено"
		if(data[i].status == 20) data[i].status = "Принято"
		if(data[i].status == 3) data[i].status = "Отправлено"
		data[i].items = data[i].items.slice(0, -2);
		$("#transaction-table-body").append('<tr>\
										<td>'+timeConverter(data[i].time)+'</td>\
										<td>'+data[i].tradeofferid+'</td>\
										<td>'+data[i].items+'</td>\
										<td>'+data[i].token+'</td>\
										<td class="trn" data-trn-key="'+data[i].status+'">'+translator.get(data[i].status)+'</td>\
									</tr>');
	}
	$("#transaction-loader").animate({opacity: 0}, 1000, function() {
		$("#transaction-loader").css("display", "none");
		$("#transaction-refresh").css("display", "inline-block");
	});
}

function setBalance(amount) {
	var old = balance;
	balance = amount;
	var c1 = new CountUp("inventory_balance", old, amount, 0, 1, options);
	c1.start();
	var c2 = new CountUp("shop_balance", old, amount, 0, 1, options);
	c2.start();
	var c3 = new CountUp("balance", old, amount, 0, 1, options);
	c3.start();
}

function setLevel(data) {
	$('#account-level').text("Lvl " + data.level);
	$('#reward-claim-level').text("Lvl " + data.level);
	var d = 25 * data.level + 25;
	if(d > 2500) d = 2500;
	$('#reward-claim-amount').text(d);
	var needExp = 10000 * data.level + 5000;
	$('#account-level-bar-info').text(data.exp + " / " + needExp);
	var percent = 100 - (Number(data.exp) / Number(needExp) * 100);
	if(percent < 0) percent = 0;
	$(".level-bar-fill").css("stroke-dashoffset", percent)
}

function setWithdrawStat(data) {
	var f = Number(data.todeposit) - Number(data.deposited);
	$("#account-withdraw-bar-info").text(data.deposited + " / " + data.todeposit);
	if(f <= 0) {
		$('#need-to-bet span').html("");
		$('#account-withdraw-bar-info').html("<span class='trn' data-trn-key='Теперь вы можете выводить предметы из магазина!'>"+translator.get("Теперь вы можете выводить предметы из магазина!")+"</span>");
	} else {
		$('#need-to-bet span b').text(f);
	}
	var percent = 100 - (Number(data.deposited) / Number(data.todeposit) * 100);
	if(percent < 0) percent = 0;
	$(".withdraw-bar-fill").css("stroke-dashoffset", percent)
}

function startCountdownRoulette() {
    countdown_roulette = 1;
    countdown_roulette_int = setInterval(function() {
        countdown_roulette--;
        if (countdown_roulette == 0) {
            clearInterval(countdown_roulette_int);
			$('#content-allbets .col').each(function() {
				$(this).css("opacity", "0.3");
			});
        }
    }, 1000);
}

var cacheDoubleBet = {
	'my-bets-2x' : 0,
	'my-bets-3x' : 0,
	'my-bets-5x' : 0,
	'my-bets-50x' : 0
}

var cacheAllBet = {
	'all-bets-2x-total' : 0,
	'all-bets-3x-total' : 0,
	'all-bets-5x-total' : 0,
	'all-bets-50x-total' : 0
}

var currentTotals = {
	"grey": 0,
	"red": 0,
	"blue": 0,
	"gold": 0
}

var icons2 = {
	'grey' : '2x',
	'red' : '3x',
	'blue' : '5x',
	'gold' : '50x'
};

var cp;

function animateTotal(color) {
	setTimeout(function() {
		var fv = "all-bets-"+icons2[color]+"-bets";
		cp = new CountUp(fv, parseFloat($("."+color+"-person-total").text()), currentTotals[color], 0, 1, options);
		cp.start();
	}, 1000);
}

function doubleBet(color, steamid, deposit, avatar, name, boturl) {
	var options = {
		useEasing : false,
		useGrouping : true,
		separator : ' '
	};

	var icons = {
		'grey' : 'x2',
		'red' : 'x3',
		'blue' : 'x5',
		'gold' : 'x50'
	};

	var icons2 = {
		'grey' : '2x',
		'red' : '3x',
		'blue' : '5x',
		'gold' : '50x'
	};

    if (game == "roulette") {
        var total = parseFloat($("#all-bets-"+icons2[color]+"-total").text().replace(" ",""));

		cacheAllBet["all-bets-"+icons2[color]+"-total"] = parseFloat(cacheAllBet["all-bets-"+icons2[color]+"-total"]) + parseFloat(deposit);

		var num2 = cacheAllBet["all-bets-"+icons2[color]+"-total"];

        currentTotals[color]++;
		animateTotal(color);

		var gf = "all-bets-"+icons2[color]+"-total";

		var demo = new CountUp(gf, total, num2, 0, 1, options);
		demo.start();

		if(steamid == $('#steamid').val()) {
			$("#my-bets-"+icons2[color]+"-wrapper").stop().css("opacity", "1");
			cacheDoubleBet["my-bets-"+icons2[color]] = cacheDoubleBet["my-bets-"+icons2[color]] + deposit;
			var num = $("#my-bets-"+icons2[color]).text();
			num = num.replace(" ","")
			var num2 = cacheDoubleBet["my-bets-"+icons2[color]];
			var fv = "my-bets-"+icons2[color];
			var demo = new CountUp(fv, num, num2, 0, 1, options);
			demo.start();
		}

		var href = '';
		if(boturl == 1) href = 'href="https://steamcommunity.com/profiles/'+steamid+'"';

		$("."+color+"-wrapper").prepend('<div class="all-bets-content">	\
											<div class="all-bets-content-user">		\
												<a class="all-bets-profile-link" '+href+'>\
												<img class="all-bets-content-avatar" src="'+avatar+'">\
												<span>'+name+'</span></a>\
											</div>	\
											<div class="all-bets-content-bet">	\
												<img src="static/images/'+icons[color]+'.png" class="bet-icon"><span class="bet-amount">'+deposit+'</span>	\
											</div>\
										</div>')
    }
}


var rollColors = {
	1 : 'blue',
	2 : 'grey',
	3 : 'red',
	4 : 'grey',
	5 : 'red',
	6 : 'grey',
	7 : 'red',
	8 : 'grey',
	9 : 'blue',
	10 : 'grey',
	11 : 'blue',
	12 : 'grey',
	13 : 'red',
	14 : 'grey',
	15 : 'red',
	16 : 'grey',
	17 : 'red',
	18 : 'grey',
	19 : 'blue',
	20 : 'grey',
	21 : 'blue',
	22 : 'grey',
	23 : 'red',
	24 : 'grey',
	25 : 'red',
	26 : 'grey',
	27 : 'red',
	28 : 'grey',
	29 : 'red',
	30 : 'grey',
	31 : 'red',
	32 : 'grey',
	33 : 'blue',
	34 : 'grey',
	35 : 'blue',
	36 : 'grey',
	37 : 'red',
	38 : 'grey',
	39 : 'red',
	40 : 'grey',
	41 : 'red',
	42 : 'grey',
	43 : 'blue',
	44 : 'grey',
	45 : 'blue',
	46 : 'grey',
	47 : 'red',
	48 : 'grey',
	49 : 'red',
	50 : 'grey',
	51 : 'red',
	52 : 'grey',
	53 : 'blue',
	54 : 'gold'
}

function doubleRoll(color, countdown, last) {
	$("#wheel-timer").css("display", "none");
	var rc = [];

	$('#content-allbets .col').each(function() {
		$(this).css("opacity", "0.3");
	});

	for(var key in rollColors) {
		if(!rollColors[key]) return;
		if(rollColors[key] == color) rc.push(key);
	}
	var num = rc[Math.floor(Math.random() * rc.length)];
	var p = 360 / 54 * Number(num) + 720 - 2;
	if(Math.round(Math.random()*1) == 1) p -= 3;
	$("#content-wheel-canvas").css("text-indent", "0px");
	$('#content-wheel-canvas').animate({ textIndent: p }, {
		step: function(now,fx) {
			var i = Math.floor((360 + (360 - now % 360)) % 360 / 360 * 54);
			if(i == 0) i = 54;
			var c = rollColors[i];
			if(c == "grey") c = "rgb(45,50,73)";
			if(c == "red") c = "rgb(208,51,82)";
			if(c == "blue") c = "rgb(26,169,201)";
			if(c == "gold") c = "rgb(248, 191, 96)";
			$("#wheel-pointer").css({color: c});
			$("#wheel-timer").css({color: c});
			$(this).css('-webkit-transform','rotate('+now+'deg)');
		}, duration:10000
	}, 'easeOutCubic');
	setTimeout(function() {
		var numbers = {
			'grey' : 0,
			'red' : 1,
			'blue' : 2,
			'gold' : 3
		}
		setTimeout(function() {
			$("."+color+"-block").css("opacity", "1");
			var icons2 = {
				'grey' : '2x',
				'red' : '3x',
				'blue' : '5x',
				'gold' : '50x'
			};
			var coef = 0;
			if(color == "grey") coef = 2;
			if(color == "red") coef = 3;
			if(color == "blue") coef = 5;
			if(color == "gold") coef = 50;
			var total = parseFloat($("#all-bets-"+icons2[color]+"-total").text().replace(" ",""));
			var num2 = parseFloat(total) * coef;
			var gf = "all-bets-"+icons2[color]+"-total";
			var demo = new CountUp(gf, total, num2, 0, 1, options);
			demo.start();

			setTimeout(function() {
				$('#content-allbets .col').each(function() {
					$(this).css("opacity", "1");
					rouletteNextGame(0);
				});
			}, 2000);
		}, 1000);
		var model = '<div class="past-'+numbers[last.color]+' past-tooltip">\
							<div class="past-color"></div>\
							<div class="past-queue-tooltip tooltip-'+numbers[last.color]+'" style="left: -111px; top: '+(17 + 9 * $("#past-queue-wrapper .past-tooltip").length)+'px; display: none;"><span>Hash</span>\
								<br>'+last.hash+'\
								<br><span>Salt</span>\
								<br>'+last.salt+'\
								<br><span>Random</span>\
								<br>'+last.random+'</div>\
						</div>';
		$('#past-queue').scrollTop(99999);
		$("#past-queue-more").css("display", "none");
		$("#past-queue-wrapper").append(model);
	}, 10000);

}

function timeConverter(UNIX_timestamp){
	var t = (UNIX_timestamp * 1000);
	var a = new Date(t);
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	if(hour < 9) hour = "0" + hour;
	if(min < 9) min = "0" + min;
	if(sec < 9) sec = "0" + sec;
	var time = date + ' ' + month + ' ' + year + ' ' + a.toLocaleTimeString();
	return time;
}


function addMsg(data) {
	var color = "";
	if(data.group == 2) color = "admin2"
	if(data.group == 1) color = "moderator"
	if(data.group == 0) color = "regular";
	if(data.name.indexOf("Lvl 500") != -1) color = "veteran";
	if(data.name.indexOf("System") != -1 && data.steamid == "1") color = "admin";
	if(data.name.indexOf("CHAT SYSTEM") != -1 && data.steamid == "1") color = "admin";

	var trntotp = '';

	if(data.steamid == "1" && data.message.indexOf('Вы забанены за нарушение правил.') != -1) {
		data.message = translator.get(data.message);
		trntotp = 'data-trn-key="Вы забанены за нарушение правил."';
	}
	if(data.steamid == "1" && data.message.indexOf('Автоматический бан.') != -1) {
		data.message = translator.get(data.message);
		trntotp = 'data-trn-key="Автоматический бан."';
	}

	var href = '';
	var dop = '<div class="user-popup">\
							<a class="user-popup-toggle" href="javascript:;"><i class="tiny material-icons" style="line-height: 27px;">settings</i></a>\
							<ul class="user-actions">\
								<li class="action">SteamID: '+data.steamid+'</li>\
								<li class="action"><a href="javascript:;" class="user-action cmd-add-color-user" data-steamid="'+data.steamid+'"><span>Включить подсветку</span></a></li>\
								<li class="action"><a href="javascript:;" class="user-action cmd-remove-color-user" data-steamid="'+data.steamid+'"><span>Выключить подсветку</span></a></li>\
								<li class="action"><a href="javascript:;" class="user-action cmd-remove-msg-user" data-msgid="'+data.msgid+'" data-nick="'+data.name+'" data-steamid="'+data.steamid+'"><span>Удалить сообщение</span></a></li>\
							</ul>\
						</div>';

	if(data.boturl == 1) href = 'href="https://steamcommunity.com/profiles/'+data.steamid+'"';

	if(data.steamid == "1") dop = '';

	if(data.trn && data.trn == 1) {
		var str = data.message;
		var msg = translator.get(str.substring(str.lastIndexOf('trn">')+5,str.lastIndexOf("<")));
		var nick = str.substring(0,str.lastIndexOf(" <s"));
		data.message = nick + '<span class="trn" data-trn-key="получил 15 минутную блокировку в чате.">' + msg + '</span';
	}

	var model = '<div class="message" data-msgid="'+data.msgid+'" data-steamid="'+data.steamid+'">\
					<div class="message-avatar-wrapper">\
						<img class="message-avatar" src="'+data.img+'">\
					</div>\
					<div class="message-content-wrapper">\
						<a class="message-author-'+color+'" '+href+'>'+data.name+'</a>\
						<br>\
						<span class="message-content" '+trntotp+'>'+data.message+'</span>\ ' + dop + '\
					</div>\
				</div>'
	if(data.sys && data.sys == 1) {
		$('#chat-eng').append(model);
		$('#chat-turk').append(model);
		$('#chat-rus').append(model);
		$('#chat-sys').append(model);

		$('#chat-eng').scrollTop(9999999);
		$('#chat-turk').scrollTop(9999999);
		$('#chat-rus').scrollTop(9999999);
		$('#chat-sys').scrollTop(9999999);
	} else {
		$('#chat-'+data.channel).append(model);
		$('#chat-'+data.channel).scrollTop(9999999);
	}
}

setTimeout("console.log('%c *****************************', 'font-size: 15px; color: #d03352');", 500);
setTimeout("console.log('%c Search servers... ', 'font-size: 15px; color: #1aa9c9');", 500);
setTimeout("console.log('%c Connection to the server. ', 'font-size: 15px; color: #f8bf60');", 500);
setTimeout("console.log('%c *****************************', 'font-size: 15px; color: #d03352');", 500);

function sendmessage() {
    if (steamid == 1) {
        return;
    }
    var text = $('#chat-input').val().replace(/[\n\r]/g, '').replace(/\s{2,}/g, '').trim();
    $('#chat-input').val('');
    if (!text) {
		if(language == "rus") Materialize.toast("Сообщение не может быть пустое.", 4000);
		if(language == "eng") Materialize.toast("The message cannot be empty.", 4000);
		if(language == "de") Materialize.toast("Die Nachricht darf nicht leer sein.", 4000);
		if(language == "pl") Materialize.toast("Komunikat nie może być puste.", 4000);
		if(language == "turk") Materialize.toast("Mesaj olamaz boş.", 4000);
		if(language == "ch") Materialize.toast("消息就不是空的。", 4000);
        return;
    }
    var onlyspaces = true;
    var splited = text.split('');
    for (var key in splited) {
        if (splited[key] != ' ') onlyspaces = false;
    }
    if (text.length < 1 || onlyspaces) {
        	if(language == "rus") Materialize.toast("Сообщение не может быть пустое.", 4000);
			if(language == "eng") Materialize.toast("The message cannot be empty.", 4000);
			if(language == "de") Materialize.toast("Die Nachricht darf nicht leer sein.", 4000);
			if(language == "pl") Materialize.toast("Komunikat nie może być puste.", 4000);
			if(language == "turk") Materialize.toast("Mesaj olamaz boş.", 4000);
			if(language == "ch") Materialize.toast("消息就不是空的。", 4000);
        return;
    }
    socket.emit('chat_send', {
        steamid: steamid,
        salt: salt,
        message: text,
		channel: CHAT_CHANNEL
    });
}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : false;
}

function showmodal(type, text) {
    if (type == 'success') $('#gaymodalico').html('<div class="mail-ico"></div>');
    if (type == 'warning') $('#gaymodalico').html('<div class="warning-ico"></div>');
    if (type == 'gift') $('#gaymodalico').html('<div class="gift-ico"></div>');
    $('#gaymodalcontent').html(text);
}

function renderItem(assetid, itemName, itemImg, itemPrice, type, bot) {
	var icons = {
		'grey' : 'x2',
		'red' : 'x3',
		'blue' : 'x5',
		'gold' : 'x50'
	};
	var cl = '';
	if(Number(itemPrice) >= minprice) cl = 'inventory-item';
	if(Number(itemPrice) < minprice) cl = 'inventory-item-faded';
    if (type == "player") {
        $('#inventory').prepend('<div id="inventory-'+assetid+'" class="'+cl+' noselect" data-assetid="' + assetid + '" data-price="' + itemPrice + '" data-original-title="' + itemName + '">\
											<span class="item-name">'+itemName+'</span>\
											<div class="item-image-wrapper">\
												<img class="item-image" src="https://steamcommunity-a.akamaihd.net/economy/image/' + itemImg + '/117fx90f">\
											</div>\
											<div class="item-price">\
												<img class="item-icon" src="static/images/'+icons[site_color]+'.png"><span>'+numberWithCommas(itemPrice)+'</span>\
											</div>\
										</div>');
    } else {
		$('#shop').prepend('<div id="shop-' + assetid + '" class="shop-item-wrapper noselect"data-assetid="' + assetid + '" data-price="' + itemPrice + '" data-original-title="' + itemName + '" data-bot="'+bot+'">\
									<div class="shop-item">\
										<span class="item-name">'+itemName+'</span>\
										<div class="item-image-wrapper">\
											<img class="item-image" src="https://steamcommunity-a.akamaihd.net/economy/image/' + itemImg + '/117fx90f">\
										</div>\
										<div class="item-price">\
											<img class="item-icon" src="static/images/'+icons[site_color]+'.png"><span>'+itemPrice+'</span>\
										</div>\
									</div>\
									<a class="item-link trn" data-trn-key="ОСМОТРЕТЬ" href="steam://rungame/570/76561202255233023/+csgo_econ_action_preview%20S76561198319934057A8762875467D7065631183057149198">'+translator.get("ОСМОТРЕТЬ")+'</a>\
								</div>');
	}
    $('.inventory-item').sort(function(a, b) {
        var contentA = parseInt($(a).attr('data-sort'));
        var contentB = parseInt($(b).attr('data-sort'));
        return (contentA > contentB) ? -1 : (contentA < contentB) ? 1 : 0;
    }).appendTo($('#withdrawal2'));
}

function renderContainerItemCsgo(assetid, itemName, itemImg, itemPrice, type, bot, wear, id) {
	var icons = {
		'grey' : 'x2',
		'red' : 'x3',
		'blue' : 'x5',
		'gold' : 'x50'
	};
	var fl = encodeURIComponent(itemName);
	var model = '<div id="shop-' + id + '" class="shop-item-wrapper noselect" data-assetid="' + assetid + '" data-price="' + itemPrice + '" data-original-title="' + itemName + '" data-bot="'+bot+'">\
									<div class="shop-item">\
										<span class="item-name">'+itemName+'</span>\
										<div class="item-image-wrapper">\
											<img class="item-image" src="https://steamcommunity-a.akamaihd.net/economy/image/' + itemImg + '/117fx90f">\
										</div>\
										<div class="item-price">\
											<img class="item-icon" src="static/images/'+icons[site_color]+'.png"><span>'+numberWithCommas(itemPrice)+'</span>\
										</div>\
									</div>\
									<a class="item-link trn" data-trn-key="ОСМОТРЕТЬ" href="http://steamcommunity.com/market/listings/730/'+fl+'" target="_blank">'+translator.get("ОСМОТРЕТЬ")+'</a>\
								</div>'
	return model;
}

function renderContainerItemDota2(assetid, itemName, itemImg, itemPrice, type, bot, wear, id) {
	var icons = {
		'grey' : 'x2',
		'red' : 'x3',
		'blue' : 'x5',
		'gold' : 'x50'
	};
	var fl = encodeURIComponent(itemName);
	var model = '<div id="shop-' + id + '" class="shop-item-wrapper noselect" data-assetid="' + assetid + '" data-price="' + itemPrice + '" data-original-title="' + itemName + '" data-bot="'+bot+'">\
									<div class="shop-item">\
										<span class="item-name">'+itemName+'</span>\
										<div class="item-image-wrapper">\
											<img class="item-image" src="https://steamcommunity-a.akamaihd.net/economy/image/' + itemImg + '/117fx90f">\
										</div>\
										<div class="item-price">\
											<img class="item-icon" src="static/images/'+icons[site_color]+'.png"><span>'+numberWithCommas(itemPrice)+'</span>\
										</div>\
									</div>\
									<a class="item-link trn" data-trn-key="ОСМОТРЕТЬ" href="http://steamcommunity.com/market/listings/570/'+fl+'" target="_blank">'+translator.get("ОСМОТРЕТЬ")+'</a>\
								</div>'
	return model;
}

function renderContainerItemInventory_dota2(assetid, itemName, itemImg, itemPrice, type, bot, wear, id) {
	var icons = {
		'grey' : 'x2',
		'red' : 'x3',
		'blue' : 'x5',
		'gold' : 'x50'
	};
	var fl = encodeURIComponent(itemName + wear);
	var model = '<div class="'+(Number(itemPrice) >= minprice ? 'inventory-item':'inventory-item-faded')+'" data-assetid="'+assetid+'" data-appid="570">\
					<span class="item-name">'+itemName+'</span>\
					<div class="item-image-wrapper">\
						<img class="item-image" src="https://steamcommunity-a.akamaihd.net/economy/image/' + itemImg + '/117fx90f">\
					</div>\
					<div class="item-price">\
						<img class="item-icon" src="static/images/'+icons[site_color]+'.png"><span>'+numberWithCommas(itemPrice)+'</span>\
					</div>\
				</div>'
	return model;
}

function renderContainerItemInventory_csgo(assetid, itemName, itemImg, itemPrice, type, bot, wear, id) {
	var icons = {
		'grey' : 'x2',
		'red' : 'x3',
		'blue' : 'x5',
		'gold' : 'x50'
	};
	var fl = encodeURIComponent(itemName + wear);
	var model = '<div class="'+(Number(itemPrice) >= minprice ? 'inventory-item':'inventory-item-faded')+'" data-assetid="'+assetid+'" data-appid="730">\
					<span class="item-name">'+itemName+'</span>\
					<div class="item-image-wrapper">\
						<img class="item-image" src="https://steamcommunity-a.akamaihd.net/economy/image/' + itemImg + '/117fx90f">\
					</div>\
					<div class="item-price">\
						<img class="item-icon" src="static/images/'+icons[site_color]+'.png"><span>'+numberWithCommas(itemPrice)+'</span>\
					</div>\
				</div>'
	return model;
}

function settings_save() {
    if (steamid == 1) {
        log('error steam', 2);
        if(language == "rus") Materialize.toast("Войдите через Steam.", 4000);
		if(language == "eng") Materialize.toast("Sign in through Steam.", 4000);
		if(language == "de") Materialize.toast("Melden Sie sich über Steam.", 4000);
		if(language == "pl") Materialize.toast("Zaloguj się przez Steam.", 4000);
		if(language == "turk") Materialize.toast("Oturum Steam üzerinden.", 4000);
		if(language == "ch") Materialize.toast("标志在通过蒸汽。", 4000);
        return;
    }
    var newtradelink = $('#trade-url-input').val();
    possibleId = newtradelink.substr(51).substr(0, newtradelink.length - 66);
    actuallId = convertid(steamid);

	$("#trade-url-submit").css("display", "none");
	$("#trade-url-loader").css("opacity", "1");
	$("#trade-url-loader").css("display", "inline-block");
	setTimeout(function() {
		$("#trade-url-loader").animate({opacity: 0}, 1000, function() {
			$("#trade-url-submit").css("display", "inline-block");
			$("#trade-url-loader").css("display", "none");
		});
	}, 1000);

    if (possibleId != actuallId) {
        log('error wrong link', 2);
        if(language == "rus") Materialize.toast("Введите ссылку на обмен.", 4000);
		if(language == "eng") Materialize.toast("Enter trade link.", 4000);
		if(language == "de") Materialize.toast("Geben Sie den Link auf den Austausch.", 4000);
		if(language == "pl") Materialize.toast("Wpisz link do wymiany.", 4000);
		if(language == "turk") Materialize.toast("Yazın başvuru paylaşımı.", 4000);
		if(language == "ch") Materialize.toast("该链接交换。", 4000);
        return;
    }
    if (!newtradelink) {
        log('error zero size link', 2);
        if(language == "rus") Materialize.toast("Введите ссылку на обмен.", 4000);
		if(language == "eng") Materialize.toast("Enter trade link.", 4000);
		if(language == "de") Materialize.toast("Geben Sie den Link auf den Austausch.", 4000);
		if(language == "pl") Materialize.toast("Wpisz link do wymiany.", 4000);
		if(language == "turk") Materialize.toast("Yazın başvuru paylaşımı.", 4000);
		if(language == "ch") Materialize.toast("该链接交换。", 4000);
        return;
    }
    if (newtradelink.length < 70) {
        log('error wrong link', 2);
        if(language == "rus") Materialize.toast("Введите ссылку на обмен.", 4000);
		if(language == "eng") Materialize.toast("Enter trade link.", 4000);
		if(language == "de") Materialize.toast("Geben Sie den Link auf den Austausch.", 4000);
		if(language == "pl") Materialize.toast("Wpisz link do wymiany.", 4000);
		if(language == "turk") Materialize.toast("Yazın başvuru paylaşımı.", 4000);
		if(language == "ch") Materialize.toast("该链接交换。", 4000);
        return;
    }
    if (tradelink != newtradelink) {
        log('saving', 1);
        socket.emit('settings_save', {
            steamid: steamid,
            salt: salt,
            tradelink: newtradelink
        });
        tradelink = newtradelink;

    } else {
        log('error same link', 2);
        if(language == "rus") Materialize.toast("Изменений ссылки на обмен не было.", 4000);
		if(language == "eng") Materialize.toast("Changes references to the exchange was not.", 4000);
		if(language == "de") Materialize.toast("Änderungen Links auf den Austausch gab es nicht.", 4000);
		if(language == "pl") Materialize.toast("Zmiany łącza na wymianę nie było.", 4000);
		if(language == "turk") Materialize.toast("Değişiklik başvuruları döviz yoktu.", 4000);
		if(language == "ch") Materialize.toast("变化引用的交换是不是。", 4000);
    }
}

function send_coins() {
    if (steamid == 1) {
        log('error steam', 2);
        if(language == "rus") Materialize.toast("Войдите через Steam.", 4000);
		if(language == "eng") Materialize.toast("Sign in through Steam.", 4000);
		if(language == "de") Materialize.toast("Melden Sie sich über Steam.", 4000);
		if(language == "pl") Materialize.toast("Zaloguj się przez Steam.", 4000);
		if(language == "turk") Materialize.toast("Oturum Steam üzerinden.", 4000);
		if(language == "ch") Materialize.toast("标志在通过蒸汽。", 4000);
        return;
    }
    var amount = parseFloat($('#send-bux-input').val());
    var to = $('#send-openid-input').val();

	$("#send-submit").css("display", "none");
	$("#send-loader").css("opacity", "1");
	$("#send-loader").css("display", "inline-block");
	setTimeout(function() {
		$("#send-loader").animate({opacity: 0}, 1000, function() {
			$("#send-submit").css("display", "inline-block");
			$("#send-loader").css("display", "none");
		});
	}, 1000);

    if (!to || isNaN(to)) {
        if(language == "rus") Materialize.toast("Игрок с указанным Steam ID не найден.", 4000);
		if(language == "eng") Materialize.toast("The player with the specified Steam ID not found.", 4000);
		if(language == "de") Materialize.toast("Der Spieler mit der angegebenen Steam ID nicht gefunden.", 4000);
		if(language == "pl") Materialize.toast("Gracz z określonym Steam ID nie znaleziono.", 4000);
		if(language == "turk") Materialize.toast("Oyuncu belirtilen Steam ID bulunamadı.", 4000);
		if(language == "ch") Materialize.toast("玩家与指定的蒸汽ID没有找到。", 4000);
        return;
    }
    if (!amount || isNaN(amount)) {
        if(language == "rus") Materialize.toast("Введите сумму для перевода.", 4000);
		if(language == "eng") Materialize.toast("Enter the amount to transfer.", 4000);
		if(language == "de") Materialize.toast("Geben Sie den Betrag für die übersetzung.", 4000);
		if(language == "pl") Materialize.toast("Wprowadź kwotę do przelewu.", 4000);
		if(language == "turk") Materialize.toast("Tutarı girin, çeviri için.", 4000);
		if(language == "ch") Materialize.toast("酒量转移。", 4000);
        return;
    }
	if(amount > balance) {
		if(language == "rus") Materialize.toast("Недостаточно Bux на балансе.", 4000);
		if(language == "eng") Materialize.toast("Not enough Bux on the balance.", 4000);
		if(language == "de") Materialize.toast("Nicht genug Bux in der Bilanz.", 4000);
		if(language == "pl") Materialize.toast("Za mało Bux na bilansie.", 4000);
		if(language == "turk") Materialize.toast("Yetersiz Bux denge.", 4000);
		if(language == "ch") Materialize.toast("没有足够的Bux在资产负债表。", 4000);
		return;
	}
	socket.emit('send_coins', {
		steamid: steamid,
		salt: salt,
		to: to,
		amount: amount
	});
}

function deposit() {
    if (steamid == 1) {
        log('error steam', 2);
        if(language == "rus") Materialize.toast("Войдите через Steam.", 4000);
		if(language == "eng") Materialize.toast("Sign in through Steam.", 4000);
		if(language == "de") Materialize.toast("Melden Sie sich über Steam.", 4000);
		if(language == "pl") Materialize.toast("Zaloguj się przez Steam.", 4000);
		if(language == "turk") Materialize.toast("Oturum Steam üzerinden.", 4000);
		if(language == "ch") Materialize.toast("标志在通过蒸汽。", 4000);
        return;
    }
    if (itemsselected_steam.length <= 0) {
        log('error zero length', 2);
        if(language == "rus") Materialize.toast("Выберите предметы для депозита.", 4000);
		if(language == "eng") Materialize.toast("Select the items to Deposit.", 4000);
		if(language == "de") Materialize.toast("Wählen Sie Gegenstände für die Einzahlung.", 4000);
		if(language == "pl") Materialize.toast("Wybierz przedmioty do depozytu.", 4000);
		if(language == "turk") Materialize.toast("Seçin eşyalar için depozito.", 4000);
		if(language == "ch") Materialize.toast("选择的项目的存款。", 4000);
        return;
    }
    if (itemsselected_steam.length > 5) {
        log('error max length', 2);
        if(language == "rus") Materialize.toast("Максимум 5 предметов для депозита.", 4000);
		if(language == "eng") Materialize.toast("A maximum of 5 items for Deposit.", 4000);
		if(language == "de") Materialize.toast("Maximal 5 Gegenstände für die Einzahlung.", 4000);
		if(language == "pl") Materialize.toast("Maksymalnie 5 przedmiotów do depozytu.", 4000);
		if(language == "turk") Materialize.toast("En fazla 5 öğeleri için mevduat.", 4000);
		if(language == "ch") Materialize.toast("一个最大的5个项目，对存款。", 4000);
        return;
    }
    if (!tradelink || tradelink == 'notset') {
        log('error link', 2);
        if(language == "rus") Materialize.toast("Введите ссылку на обмен.", 4000);
		if(language == "eng") Materialize.toast("Enter trade link.", 4000);
		if(language == "de") Materialize.toast("Geben Sie den Link auf den Austausch.", 4000);
		if(language == "pl") Materialize.toast("Wpisz link do wymiany.", 4000);
		if(language == "turk") Materialize.toast("Yazın başvuru paylaşımı.", 4000);
		if(language == "ch") Materialize.toast("该链接交换。", 4000);
        return;
    }
	var sum = $('#inventory-checkout-amount').text();
	sum = sum.replace(" ", "");
	sum = sum.replace(" ", "");
	sum = sum.replace(",", "");
	sum = sum.replace(",", "");
    socket.emit('deposit', {
        steamid: steamid,
        salt: salt,
        items: itemsselected_steam,
        appid: appid,
		summ: sum
    });
	$("#inventory-checkout-deposit").css("display", "none");
	$("#inventory-checkout-loader").css("opacity", "1");
	$("#inventory-checkout-loader").css("display", "inline-block");
	setTimeout(function() {
		$("#inventory-checkout-loader").animate({opacity: 0}, 1000, function() {
			$("#inventory-checkout-deposit").css("display", "inline-block");
			$("#inventory-checkout-loader").css("display", "none");
		});
	}, 1000);
		if(language == "rus") Materialize.toast("Ищем свободных ботов для обмена, пожалуйста подождите...", 7000);
		if(language == "eng") Materialize.toast("Searching for free bots to trade, please wait...", 7000);
		if(language == "de") Materialize.toast("Wir suchen freie Bots für den Austausch von, bitte warten Sie...", 7000);
		if(language == "pl") Materialize.toast("Szukamy wolnych boty do wymiany, proszę czekać...", 7000);
		if(language == "turk") Materialize.toast("Arıyoruz ücretsiz botlar paylaşım için, lütfen bekleyin...", 7000);
		if(language == "ch") Materialize.toast("在寻找的机器人免费交换请等一等。。。", 7000);
}

function withdraw() {
    if (steamid == 1) {
        log('error steam', 2);
        if(language == "rus") Materialize.toast("Войдите через Steam.", 4000);
		if(language == "eng") Materialize.toast("Sign in through Steam.", 4000);
		if(language == "de") Materialize.toast("Melden Sie sich über Steam.", 4000);
		if(language == "pl") Materialize.toast("Zaloguj się przez Steam.", 4000);
		if(language == "turk") Materialize.toast("Oturum Steam üzerinden.", 4000);
		if(language == "ch") Materialize.toast("标志在通过蒸汽。", 4000);
        return;
    }
    if (itemsselected_inventory.length <= 0) {
        log('error zero length', 2);
        if(language == "rus") Materialize.toast("Выберите предметы для вывода.", 4000);
		if(language == "eng") Materialize.toast("Select items for withdraw.", 4000);
		if(language == "de") Materialize.toast("Wählen Sie die Objekte für die Ausgabe.", 4000);
		if(language == "pl") Materialize.toast("Wybierz elementy do wyjścia.", 4000);
		if(language == "turk") Materialize.toast("Seçin öğeleri görüntülemek için.", 4000);
		if(language == "ch") Materialize.toast("选项输出。", 4000);
        return;
    }
    socket.emit('withdraw', {
        steamid: steamid,
        salt: salt,
        items: itemsselected_inventory,
		sum: sumselect_inventory
    });
    if (!tradelink || tradelink == 'notset') {
        log('error link', 2);
        if(language == "rus") Materialize.toast("Введите ссылку на обмен.", 4000);
		if(language == "eng") Materialize.toast("Enter trade link.", 4000);
		if(language == "de") Materialize.toast("Geben Sie den Link auf den Austausch.", 4000);
		if(language == "pl") Materialize.toast("Wpisz link do wymiany.", 4000);
		if(language == "turk") Materialize.toast("Yazın başvuru paylaşımı.", 4000);
		if(language == "ch") Materialize.toast("该链接交换。", 4000);
        return;
    }
    if (itemsselected_inventory.length > 5) {
        log('error max length', 2);
        if(language == "rus") Materialize.toast("Максимум 5 предметов для депозита.", 4000);
		if(language == "eng") Materialize.toast("A maximum of 5 items for Deposit.", 4000);
		if(language == "de") Materialize.toast("Maximal 5 Gegenstände für die Einzahlung.", 4000);
		if(language == "pl") Materialize.toast("Maksymalnie 5 przedmiotów do depozytu.", 4000);
		if(language == "turk") Materialize.toast("En fazla 5 öğeleri için mevduat.", 4000);
		if(language == "ch") Materialize.toast("一个最大的5个项目，对存款。", 4000);
        return;
    }
	$("#shop-checkout-withdraw").css("display", "none");
	$("#shop-checkout-loader").css("opacity", "1");
	$("#shop-checkout-loader").css("display", "inline-block");
	setTimeout(function() {
		$("#shop-checkout-loader").animate({opacity: 0}, 1000, function() {
			$("#shop-checkout-withdraw").css("display", "inline-block");
			$("#shop-checkout-loader").css("display", "none");
		});
	}, 1000);
    log('searching', 1);
    if(language == "rus") Materialize.toast("Ищем выбранные предметы на ботах, пожалуйста подождите...", 7000);
	if(language == "eng") Materialize.toast("Searching for selected items on the bots, please wait...", 7000);
	if(language == "de") Materialize.toast("Suchen Sie die ausgewählten Gegenstände auf Bots zu testen, bitte warten Sie...", 7000);
	if(language == "pl") Materialize.toast("Szukamy wybrane przedmioty na botach, proszę czekać...", 7000);
	if(language == "turk") Materialize.toast("Arıyoruz, seçilen nesne botlara, lütfen bekleyin...", 7000);
	if(language == "ch") Materialize.toast("在寻找选择的项目上的机器人请等一等。。。", 7000);
}

function sendrequest(url) {
    $.ajax({
        url: url
    });
}

function loadInventorySteamDota2() {
	if(getUnixTime() - (invCache+5) >= 0) {
		var rem = itemsselected_inventory.length;
		var rem = itemsselected_steam.length;
		itemsselected_steam = [];
		sumselect_steam = 0;
		$("#inventory-refresh-dota2").css("display", "none");
		$("#inventory-loader-dota2").css("display", "inline-block");
		$("#inventory-loader-dota2").css("opacity", "1");
		socket.emit('inventory_steam_update_dota2', {
			steamid: steamid,
			salt: salt
		});
	} else {
		$("#inventory-refresh-dota2").css("display", "none");
		$("#inventory-loader-dota2").css("display", "inline-block");
		$("#inventory-loader-dota2").css("opacity", "1");

		setTimeout(function() {
			$("#inventory-loader-dota2").animate({opacity: 0}, 1000, function() {
				$("#inventory-refresh-dota2").css("display", "inline-block");
				$("#inventory-loader-dota2").css("display", "none");
			});
		}, 1000);

		if(language == "rus") Materialize.toast("Инвентарь можно загружать раз в 5 секунд.", 4000);
		if(language == "eng") Materialize.toast("The inventory can be update every 5 seconds.", 4000);
		if(language == "de") Materialize.toast("Inventar laden mal in 5 Sekunden.", 4000);
		if(language == "pl") Materialize.toast("Sprzęt można ładować raz na 5 sekund.", 4000);
		if(language == "turk") Materialize.toast("Envanter indirebilirsiniz kez 5 saniye.", 4000);
		if(language == "ch") Materialize.toast("清单可以下载，每5秒。", 4000);
	}
}

function loadInventorySteamCsgo() {
	if(getUnixTime() - (invCache+5) >= 0) {
		var rem = itemsselected_inventory.length;
		var rem = itemsselected_steam.length;
		itemsselected_steam = [];
		sumselect_steam = 0;
		$("#inventory-refresh-csgo").css("display", "none");
		$("#inventory-loader-csgo").css("display", "inline-block");
		$("#inventory-loader-csgo").css("opacity", "1");
		socket.emit('inventory_steam_update_csgo', {
			steamid: steamid,
			salt: salt
		});
	} else {
		$("#inventory-refresh-csgo").css("display", "none");
		$("#inventory-loader-csgo").css("display", "inline-block");
		$("#inventory-loader-csgo").css("opacity", "1");

		setTimeout(function() {
			$("#inventory-loader-csgo").animate({opacity: 0}, 1000, function() {
				$("#inventory-refresh-csgo").css("display", "inline-block");
				$("#inventory-loader-csgo").css("display", "none");
			});
		}, 1000);

		if(language == "rus") Materialize.toast("Инвентарь можно загружать раз в 5 секунд.", 4000);
		if(language == "eng") Materialize.toast("The inventory can be update every 5 seconds.", 4000);
		if(language == "de") Materialize.toast("Inventar laden mal in 5 Sekunden.", 4000);
		if(language == "pl") Materialize.toast("Sprzęt można ładować raz na 5 sekund.", 4000);
		if(language == "turk") Materialize.toast("Envanter indirebilirsiniz kez 5 saniye.", 4000);
		if(language == "ch") Materialize.toast("清单可以下载，每5秒。", 4000);
	}
}

function loadInventoryWebsiteCsgo() {
	$("#shop-refresh-csgo").css("display", "none");
	$("#shop-loader-csgo").css("opacity", "1");
	$("#shop-loader-csgo").css("display", "inline-block");
    itemsselected_inventory = [];
    sumselect_inventory = 0;
    if (steamid != 1) {
        socket.emit('inventory_website_update_csgo', {
            steamid: steamid,
            salt: salt
        });
    } else {
        socket.emit('inventory_website_update_notauth_csgo');
    }
}

function loadInventoryWebsiteDota2() {
	$("#shop-refresh-dota2").css("display", "none");
	$("#shop-loader-dota2").css("opacity", "1");
	$("#shop-loader-dota2").css("display", "inline-block");
    itemsselected_inventory = [];
    sumselect_inventory = 0;
    if (steamid != 1) {
        socket.emit('inventory_website_update_dota2', {
            steamid: steamid,
            salt: salt
        });
    } else {
        socket.emit('inventory_website_update_notauth_dota2');
    }
}

function filter_website(string) {
    for (var i = 0; i < banned_websites.length; i++) {
        string = string.toLowerCase().replace(banned_websites[i], '?*%#');
    }
    return string;
}

function ParseData(time) {
    var date = new Date().setTime(time).toLocaleTimeString();;
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var day = date.getDate();
    var month = dategetMonth();
    var year = date.getFullYear();
    return day + "." + month + "." + year + " ";
}

var contains = function(needle) {

    var findNaN = needle !== needle;
    var indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                var item = this[i];

                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};

/* By Developer */
