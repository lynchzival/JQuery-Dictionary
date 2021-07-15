$(document).ready(function(){

    const form = $("#form");
    const input = form.find("input[type=text]");
    const content = $("#content");
    const histBtn = $("#historyBtn");
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    let histArrTemp = new Array();

    $("#form").submit(function(event){

        let word = input.val().trim().toLowerCase();

        switch (word) {
            case "":
                break;
        
            default:

                $('#loading-image').removeClass("d-none");
                content.hide();

                const MainDicAjaxConf = {
                    "aync": "true",
                    "crossDomain": "true",
                    "url": "https://api.dictionaryapi.dev/api/v2/entries/en_US/" + word,
                };

                $.get(MainDicAjaxConf, function(obj){
                    content.html(`<h1 class="display-4 text-center mb-4">Definitions</h1>`);

                    $.each(obj, (i) => {
                        content.append(`
                            <div class="word-${i}">
                                <h1 class="display-4 text-capitalize" style="font-size: 2rem;">${obj[i].word} <sup>${i+1}</sup></h1>
                            </div>
                        `);

                        $.each(obj[i].phonetics, (k) => {
                            content.find(`div.word-${i}`).append(`
                                <p class="lead">
                                    <audio src="${obj[i].phonetics[k].audio}" class="audio"></audio>
                                    <a href="javascript:void(0)" class="text-info audio-btn"> 
                                        <i class="fas fw fa-play mr-2"></i>
                                    </a>
                                    ${obj[i].phonetics[k].text}
                                </p>
                            `);
                        });

                        $.each(obj[i].meanings, (j) => {
                            content.find(`div.word-${i}`).append(`
                                <div class="word-${i}-meaning-${j}">
                                    <p><b class="text-info">${obj[i].meanings[j].partOfSpeech}</b></p>
                                </div>
                            `);

                            $.each(obj[i].meanings[j].definitions, (x) => {

                                const setence = obj[i].meanings[j].definitions[x].definition;
                                const split = setence.split(" ");

                                content.find(`div.word-${i}`).find("div:last-child").append(`
                                    <p class="lead">${x+1}.</p>
                                `);

                                // ([A-Za-z]\w*) Match only word

                                // ([A-Za-z]|\S*['-])([a-zA-Z'-]*) match only word but also with - '
                                
                                $.each(split, (h) => {
                                    content.find(`div.word-${i}`).find("div:last-child").find("p.lead").append(`
                                        ${split[h].replace(/([A-Za-z]|\S*['-])([a-zA-Z'-]*)/g, "<a href='javascript:void(0)' class='text-white ref-word'>$1$2</a>")}
                                    `);
                                });

                                switch (obj[i].meanings[j].definitions[x].example) {
                                    case undefined:
                                        break;
                                
                                    default:
                                        content.find(`div.word-${i}`).find("div:last-child").append(`
                                            <blockquote class="blockquote">
                                                <h5 style="font-size: 1.2rem">Example</h5>
                                                <footer class="blockquote-footer">${obj[i].meanings[j].definitions[x].example}</footer>
                                            </blockquote>
                                        `);
                                        break;
                                }
                            });
                        });
                    });

                }).done(function(){
                    
                    const audios = $(".audio");
                    const audioBtns = $(".audio-btn");
                    const ref = $(".ref-word");

                    $.each(audios, (i)=> {
                        audioBtns.eq(i).on("click", ()=> {
                            if (audios[i].paused) {
                                audios[i].play();
                                audioBtns.eq(i).find("i").addClass("fa-pause").removeClass("fa-play");
                            } else {
                                audios[i].pause();
                                audioBtns.eq(i).find("i").addClass("fa-play").removeClass("fa-pause");
                            }
                        });
                        audios.eq(i).on("ended", ()=> {
                            audioBtns.eq(i).find("i").addClass("fa-play").removeClass("fa-pause");
                        });
                        audioBtns.eq(i).on("mousedown", (event)=> {
                            event.preventDefault();
                        });
                    });

                    $.each(ref, (i)=> {
                        ref.eq(i).on("click", ()=> {
                            input.val(ref.eq(i).text());
                            input.submit();
                        });
                    });

                    switch (histArrTemp[0]) {
                        case undefined:
                            if (!(localStorage.getItem("hist") == null)) {
                                histArrTemp = JSON.parse(localStorage.getItem("hist"));
                            }
                            break;
                    
                        default:
                            if (localStorage.getItem("hist" ) == null) {
                                histArrTemp = [];
                            }
                            break;
                    }

                    if (histArrTemp.length > 0) {
                        $.each(histArrTemp, (i) => {
                            if (word == histArrTemp[i]) {
                                histArrTemp.splice(i, 1);
                            }
                        });
                    }

                    histArrTemp.unshift(word);
                    localStorage.setItem("hist", JSON.stringify(histArrTemp));

                }).fail(function (error) {

                    content.html(`
                        <div class="text-center">
                            <h1 class="display-4 mb-4">${error.responseJSON.title}</h1>
                            <p class="lead text-capitalize">${word}</p>
                            <p>
                                Try
                                <a href="https://www.google.com/search?hl=en&q=dictionary&oq=dicti#dobs=${word}" target="_blank">Google Dictionary</a>
                                or
                                <a href="https://www.google.com/search?hl=en&q=${word} meaning" target="_blank">Google Search</a> 
                            </p>
                        </div>
                    `);

                }).always(function(){

                    $('#loading-image').addClass("d-none");
                    content.fadeIn(1000);

                });

                input.select();
                input.focus();
                break;
        }

        event.preventDefault();

    });

    histBtn.on("click", function(){
        const histArr = JSON.parse(localStorage.getItem("hist"));
        const badges = ["badge-secondary", "badge-primary", "badge-success", "badge-danger", "badge-warning", "badge-info", "badge-light"];

        content.hide();

        switch (histArr) {
            case null:
                content.html(`
                    <div class="text-center">
                        <h1 class="display-4 mb-4">No History Found</h1>
                        <p>Try searching a word</p>
                    </div>
                `);
                break;
        
            default:
                content.html(`
                    <div class="history-content"></div>
                    <div class="text-center">
                        <button type="button" class="btn btn-danger btn-sm" data-toggle="modal" data-target="#HistModal">
                            <i class="fas fa-trash mr-2"></i>Clear History
                        </button>
                        <div class="modal fade text-dark" id="HistModal" tabindex="-1" role="dialog" aria-hidden="true">
                            <div class="modal-dialog" role="document">
                                <div class="modal-content">
                                    <div class="modal-body">
                                        <i class="d-block display-4 my-4 fas fa-exclamation-triangle text-danger"></i>
                                        <span>Are you sure you want to permanently clear history?</span>
                                    </div>
                                    <div class="modal-footer justify-content-center">
                                        <button type="button" class="btn btn-danger btn-sm" id="clearHistBtn">Proceed</button>
                                        <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal">Discard</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);

                $.each(histArr, (i) => {
                    const rand = Math.floor(Math.random() * badges.length);
                    content.find("div.history-content").append(`
                        <a href="javascript:void(0)" class="histWordBtn badge badge-pill ${badges[rand]}">${histArr[i]}</a>
                    `);
                    const histWordBtn = $(".histWordBtn");
                    histWordBtn.eq(i).on("click", () => {
                        input.val(histWordBtn.eq(i).text());
                        input.submit();
                    });
                });

                const histConfModal = $("#HistModal");

                $("#clearHistBtn").on("click", ()=> {
                    localStorage.removeItem("hist");
                    histConfModal.modal('toggle');
                    histConfModal.on("hidden.bs.modal", () => {
                        histBtn.click();
                    });
                });

                break;
        }

        content.fadeIn(1000);
    });

});