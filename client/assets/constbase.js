'use strict';


$(document).ready(init)

function init() {
    console.log('constbase loaded');
    cssClassActivate()
    if ($('.dev-mode').length == 1) {
        initalDevPanel()
    }
}

function cssClassActivate() {
    // active the function of writing css as className
    let selector = document.querySelectorAll('div, span, h1, h2, h3, h4, h5, h6, p, body')
    for (var i = 0; i < selector.length; i++) {
        $(selector[i]).attr('style', selector[i].className.split(' ').join('; ').replace('_', ' '))
    }
}

function developing(index, el) {
    if ($(el).css('position') !== 'absolute') {
        var className = el.className
        $(el).css('position', 'relative')
        var $label = $('<label>')
        $label.addClass('dev-label').html(className.split(' ').join(' | '))
        $(el).append($label)
    }
}

function initalDevPanel() {
    $('.dev-mode div').each(developing)

    // colors setting
    $('body').on('change', '.devPanel .heightlight .color-input', devPanelCLRchanged)
    $('body').on('change', '.devPanel .heightlight .turnOn', devPanelHightlightTurnedOn)
    // $('body').on('change mousemove', '.devPanel .heightlight .opacity-slide', devPanelOCchanged)
    // $('body').on('change', '.devPanel .heightlight .opacity-input', devPanelOCIchanged)
    $('body').on('change mousemove', '.devPanel .devPanel-font-size', devPanelFZchanged)
    $('body').on('change mousemove', '.devPanel .devPanel-border-width', devPanelBWchanged)
    $('body').on('click', '.devPanel .navigator .nav-item', navigatorToggled)

    $('body').on('click', '.devPanelHandler .toggle', function() {
        $('.devPanel').toggleClass('active');
    })
    $(window).on('resize', screanInspector)
    var $devPanel = $('<devPanel>').append(`<div class="panel-container">
                <div class="navigator">
                        <div class="nav-item active" data-target="inspector">Inspector</div>
                        <div class="nav-item" data-target="style">Style</div>
                        <div class="nav-item" data-target="setting">Sccount</div>
                </div>
            </div>
                <span class='dev-setting-section inspector active'>
                    <div class="panel-container">
                        <div class="screen">
                            <div class="screen-container">
                                <span class="height">px</span>
                                <span class="width">px</span>
                            </div>
                            <div class="device">iphone 6</div>
                        </div>
                    </div>
                    <div class="panel-container">
                        <div class="title">Heightlight Element</div>
                        <div class="setting-container heightlight">
                            <table>
                                <tr>
                                    <td>
                                        <input class="turnOn" type="checkbox" checked="checked">
                                    </td>
                                    <td>
                                        <input type="color" class="color-input" value="#ff0000">
                                    </td>
                                    <td>
                                        <input type="range" min="0" max="200" value="85" class="devPanel-font-size" style="max-width: 130px;">
                                    </td>
                                </tr>
                                <tr>
                                    <td>

                                    </td>
                                    <td>
                                        <p>Color</p>
                                    </td>
                                    <td>
                                        <p>Label Size</p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div class="panel-container">
                        <div class="title">font size: <span class="current-font-size"></span></div>
                        <div class="setting-container label">
                            <input type="range" min="0" max="200" value="85" class="devPanel-font-size">
                        </div>
                    </div>
                </span>
            <span class='dev-setting-section style'>
                style
            </span>
            <span class='dev-setting-section setting'>
                setting
            </span>
        </div>
        `)
    var $devToolStart = $('<devToolStart>').addClass('devPanelHandler').append(`<div class="toggle">||</div>`)
    $devPanel.addClass('devPanel')
    $('body').append($devToolStart)
    $('body').append($devPanel)
    $('.current-font-size').html('8.5px')
    $('.current-border-width').html($('body.dev-mode div').css('outline-width'))
    // $('.devPanel .label .opacity-input').val($('.devPanel .label .opacity-slide').val())
    $('.devPanel .screen .height').html($(window).height() + 'px')
    $('.devPanel .screen .width').html($(window).width() + 'px')
    $('.devPanel .screen .screen-container').width($(window).width() / 10 + 'px')
    $('.devPanel .screen .screen-container').height($(window).height() / 10 + 'px')
    screanInspector()
    if($('.devPanel .heightlight .turnOn').attr('checked')){

    }
}

function navigatorToggled(el) {
    $('.nav-item').removeClass('active');
    $(el.target).addClass('active');
    var target = $(el.target).attr('data-target');
    $(`.devPanel .dev-setting-section`).removeClass('active');
    $(`.devPanel .dev-setting-section`).hide()
    $(`.devPanel .dev-setting-section.${target}`).addClass('active');
    $(`.devPanel .dev-setting-section.${target}`).fadeIn(100);
}

function screanInspector() {
    $('.devPanel .screen .height').html($(window).height() + 'px')
    $('.devPanel .screen .width').html($(window).width() + 'px')
    $('.devPanel .screen .screen-container').width($(window).width() / 10 + 'px')
    $('.devPanel .screen .screen-container').height($(window).height() / 10 + 'px')

    if ($(window).width() < 780 && $(window).width() > 500) {
        $('.devPanel .screen .device').html('Tablet')
    } else if ($(window).width() < 500) {
        $('.devPanel .screen .device').html('Phone')
    } else if ($(window).width() > 1200) {
        $('.devPanel .screen .device').html('Desktop 4K')
    } else {
        $('.devPanel .screen .device').html('Desktop')
    }
}

function devPanelFZchanged() {
    $('.current-font-size').html($(this).val() / 10 + 'px')
    $('body.dev-mode .dev-label').css('font-size', $(this).val() / 10 + 'px');
}

function devPanelBWchanged() {
    $('.current-border-width').html($(this).val() + 'px')
    $('body.dev-mode div').css('outline-width', $(this).val() + 'px');
}

function devPanelCLRchanged() {
    $('body.dev-mode div').css('outline-color', $(this).val());
    $('body.dev-mode .dev-label').css('background-color', $(this).val());
}
function devPanelHightlightTurnedOn(el){
    console.log($(el.target).attr('checked'));
    console.log($(el.target).val());
}
