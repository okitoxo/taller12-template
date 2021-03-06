/**
 *  @Website: apollotheme.com - prestashop template provider
 *  @author Apollotheme <apollotheme@gmail.com>
 *  @copyright  Apollotheme
 *  @description: 
 */
imgId = null; // using for store object image select a source in function select image
function log(message) {
    console.log(message);
}
function htmlentities(str) {
    var textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.innerHTML;
}
function htmlentitiesDecode(str) {
    var textarea = document.createElement("textarea");
    textarea.innerHTML = str;
    return textarea.value;
}
(function ($) {
    $.fn.apPageBuilder = function () {
        this.currentElement = null;
        this.ajaxShortCodeUrl = null;
        this.ajaxHomeUrl = null;
        this.shortCodeField = null;
        this.shortcodeInfos = null;
        this.languages = null;
        this.lang_id = 0;
        this.classWidget = 'ui-widget ui-widget-content ui-helper-clearfix ui-corner-all';
        this.classWidgetHeader = 'ui-widget-header ui-corner-all';
        this.widthSupport = null;
        this.arrayCol = null;
        this.windowWidth = 0;
        this.imgController = null;
        this.parentId = null;
        this.profileId = null;

        this.process = function (DATAFORM, DATAINFO, LANGS) {
            var $globalthis = this;
            $globalthis.windowWidth = $(window).width();
            $globalthis.shortcodeInfos = jQuery.parseJSON(DATAINFO);
            $globalthis.languages = jQuery.parseJSON(LANGS);
            $globalthis.initDataFrom(DATAFORM);
            $globalthis.widthSupport = ["1", "2", "2.4", "3", "4", "5", "4.8", "6", "7", "7.2", "8", "9", "9.6", "10", "11", "12"];
            $globalthis.arrayCol = ["sp", "xs", "sm", "md", "lg", "xl"];
            $globalthis.initColumnSetting();

            $globalthis.setGroupAction();
            $globalthis.sortable();
            $globalthis.setButtonAction();
            $globalthis.submitForm();

            // Load form after come back from live edit mode
            var type = window.location.href.split('#');
            var hash = '';
            if (type.length > 1) {
                hash = type[1];
                var btn = $("." + hash).find(".btn-edit");
                //$(btn).trigger("click");
            }
            //$globalthis.setRowAction();
        };
        this.initDataFrom = function (data) {
			 var $globalthis = this;
            if (data != '{}') {
                dataObj = jQuery.parseJSON(data);

                Object.keys(dataObj).forEach(function (key) {
                    $('.' + key).data('form', dataObj[key]);
					//DONGND:: install data animation for column and group
					if (typeof dataObj[key].animation != 'undefined')
					{					
						if ($('.' + key).find('.animation-button').first().length)
						{							
							var animation_bt = $('.' + key).find('.animation-button').first();
							var animation_type = dataObj[key].animation ? dataObj[key].animation : 'none';
							var animation_delay = dataObj[key].animation_delay ? dataObj[key].animation_delay : 1;
							var animation_duration = dataObj[key].animation_duration ? dataObj[key].animation_duration : 1;
							var animation_iteration_count = dataObj[key].animation_iteration_count ? dataObj[key].animation_iteration_count : 1;
							var animation_infinite = dataObj[key].animation_infinite ? dataObj[key].animation_infinite : 0;	
							
							$globalthis.assignConfigAnimation(animation_bt, animation_type, animation_delay, animation_duration, animation_iteration_count, animation_infinite);
						}
					}
					
                });
				
				//DONGND:: fix can't click tab 1 when create new widget tab				
				$('.ApTabs:not(#default_ApTabs)').each(function(){					
					var activeTabId = $(this).data('form').active_tab;					
					if (activeTabId != '' && parseInt(activeTabId))
					{
						$(this).find('.nav-tabs a').eq(parseInt(activeTabId)-1).tab('show');
					}
				});

                //DONGND:: fix can't click tab 1 when create new widget tab             
                $('.ApAjaxTabs:not(#default_ApAjaxTabs)').each(function(){                  
                    var activeTabId = $(this).data('form').active_tab;                  
                    if (activeTabId != '' && parseInt(activeTabId))
                    {
                        $(this).find('.nav-tabs a').eq(parseInt(activeTabId)-1).tab('show');
                    }
                })
            }
        };
        this.getColDefault = function () {
            return {xl:12, lg: 12, md: 12, sm: 12, xs: 12, sp: 12};
        };
        //set action for group
        this.setGroupAction = function () {

            //duplicate group
            $('.gaction-duplicate').click(function () {
                var duplicate = $(this).closest('.group-row').clone(1);
                //remove tooltip because wrong position
                $('.tooltip', $(duplicate)).remove();
                $('.label-tooltip', $(duplicate)).tooltip('disable');
                $('.hook-content-footer', $(this).closest('.hook-content')).before(duplicate);
            });

            $('.number-column').click(function () {
                column = $(this).data('cols');
            });

            $('.gaction-toggle').click(function () {
                $(this).closest('.group-row').find('.group-content').first().toggle('clip');
            });
        };
        //sort group
        this.sortable = function () {
            var $globalthis = this;

            $(".hook-content").sortable({
                connectWith: ".hook-content",
                handle: ".gaction-drag"
            });
            $(".group-row").addClass($globalthis.classWidget)
                    .find(".gaction-drag").addClass($globalthis.classWidgetHeader);

            $(".hook-content .group-content").sortable({
                connectWith: ".group-content",
                handle: ".caction-drag"
            });
            $(".column-row").addClass($globalthis.classWidget)
                    .find(".caction-drag").addClass($globalthis.classWidgetHeader);

            $(".group-content .column-content").sortable({
                connectWith: ".column-content",
                handle: ".waction-drag"
            });
            $(".widget-row").addClass($globalthis.classWidget)
                    .find(".waction-drag").addClass($globalthis.classWidgetHeader);

            $(".subwidget-content").sortable({
                connectWith: ".subwidget-content",
                handle: ".waction-drag"
            });
//            $( ".widget-row" ).addClass( $globalthis.classWidget )
//                .find( ".waction-drag" ).addClass( $globalthis.classWidgetHeader );    

        };
        this.downloadFile = function (filename, result) {
            //csvData = 'data:application/xml;charset=utf-8,' + result;
            //console.log(result);
            $("#export_process")
                    .attr({
                        'download': filename,
                        'href': result,
                        'target': '_blank'
                    });
            $("#export_process").get(0).click();
        };
        //general action
        this.setButtonAction = function () {
            var $globalthis = this;
            $globalthis.initControllInRow();
            this.createColumn = function (obj, currentId) {
                var widthCol = $(obj).data('width');
                var classActive = $globalthis.returnWidthClass();
                var col = $(obj).data('col');
                var realValue = widthCol.toString().replace('.', '-');
                for (var i = 1; i <= col; i++) {
                    wrapper = currentId;///$($globalthis.currentElement).find('.group-content').first();
                    column = $('#default_column').clone();
                    var cls = $(column).attr("class");
                    //column-row col-sp-12 col-xs-12 col-sm-12 col-md-12 col-lg-12 ui-widget ui-widget-content ui-helper-clearfix ui-corner-all
                    cls = cls.replace("col-xl-12", "col-xl-" + realValue);
                    cls = cls.replace("col-lg-12", "col-lg-" + realValue);
                    cls = cls.replace("col-md-12", "col-md-" + realValue);
                    cls = cls.replace("col-sm-12", "col-sm-" + realValue);
                    cls = cls.replace("col-xs-12", "col-xs-" + realValue);
                    cls = cls.replace("col-sp-12", "col-sp-" + realValue);
                    $(column).attr("class", cls);
                    objColumn = {form_id: "form_" + $globalthis.getRandomNumber()};
                    
                    objColumn.sm = widthCol;
                    objColumn.xs = widthCol;
                    objColumn.sp = widthCol;
                    if (classActive == "md" || classActive == "lg" || classActive == "xl") {
                        objColumn.md = widthCol;
                        objColumn.lg = widthCol;
                        objColumn.xl = widthCol;
                    }
                    //jQuery.extend(objColumn, $globalthis.getColDefault());
                    $(column).data("form", objColumn);

                    column.removeAttr('id');
                    wrapper.append(column);
                    $globalthis.getNumberColumnInClass(column, classActive);
                    $(".label-tooltip").tooltip();
                }
            }
            $(document).on("click", ".column-add", function () {
                $globalthis.createColumn(this, $globalthis.currentElement);
            });
            $(document).on("click", ".group-add", function () {
                var item = $(this).data("col");
                currentE = $globalthis.currentElement;
                // Create a group blank
                if (item == 0) {
                    group = $("#default_row").clone();
                    group.removeAttr('id');
                    //var html = $(group).find(".group-controll-right").html();
                    //$(group).find(".group-controll-right").html(html);
                    $(group).data("form", {form_id: "form_" + $globalthis.getRandomNumber(), 'class': 'row'});
                    $(currentE).before(group);
                    $globalthis.initControllInRow();
                }
                // Display popup list Widget for add new a widget
                else if (item == 1) {
                    // This code similar event click to button:
                    // $(".btn-new-widget").trigger("click");
                    var url = $globalthis.ajaxHomeUrl + '&ajax=1&action=renderList';
                    var data = '';
                    $("#ap_loading").show();

                    $.ajax({
                        type: 'POST',
                        headers: {"cache-control": "no-cache"},
                        url: url,
                        async: true,
                        data: data,
                        dataType: 'json',
                        cache: false,
                        success: function (json) {
                            $("#ap_loading").hide();
                            if (json && json.hasError == true){
                                alert(json.errors);
                            }else{
                                $("#txt-search").show();
                                $('#myModalLabel').html($('#myModalLabel').data('addnew'));
                                $('#modal_form .modal-body').html(json.result);
                                $('#modal_form .modal-footer').hide();
                                $('#modal_form').modal('show');
                                $('#modal_form').removeClass('modal-edit').addClass('modal-new');
                                $globalthis.setFormAction();
                                $globalthis.initControllInRow();
                                $("#txt-search").focus();
                                $globalthis.initIsotopAction();
                            }
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            $("#ap_loading").hide();
                            alert("TECHNICAL ERROR: \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);
                        }
                    });
                } else {
                    group = $("#default_row").clone();
                    group.removeAttr('id');
                    //var html = $(group).find(".group-controll-right").html();
                    //$(group).find(".group-controll-right").html(html);
                    $(group).data("form", {form_id: "form_" + $globalthis.getRandomNumber(), 'class': 'row'});
                    $(currentE).before(group);
                    $globalthis.createColumn(this, group);
                    $globalthis.initControllInRow();
                }
            });
            $(document).on("click", ".btn-select-profile", function () {
                if (!confirm($("#form_content").data('select')))
                    return false;
            });

            $(document).on("click", ".btn-back-to-list", function () {
                currentElement = $globalthis.currentElement;
                //add new in column
                if ($(currentElement).hasClass('column-content') || $(currentElement).hasClass('subwidget-content')) {
                    $(currentElement).parent().find('.btn-new-widget').first().trigger('click');
                }
                //add new in group
                else {
                    $(currentElement).parent().find('.hook-content-footer .btn-new-widget').trigger('click');
                }
            });
            //save widget

            $(document).on("click", ".btn-savewidget", function () {
                hideFormLevel2();
                currentElement = $globalthis.currentElement;
                //add new widget
                if ($("#modal_form").hasClass("modal-new")) {
                    //add new widget in column
                    if ($(currentElement).hasClass('column-content')) {
                        $globalthis.saveWidget('column');
                    }
                    else if ($(currentElement).hasClass('subwidget-content')) {
                        $globalthis.saveWidget('column');
                    }
                    //add new widget in hook
                    else {
                        $globalthis.saveWidget('hook');
                    }
                } else {
                    $globalthis.saveWidget('update');
                }
                $globalthis.currentElement = null;
                $(".label-tooltip").tooltip();
                $('#modal_form').modal('hide');
                $globalthis.initControllInRow();
            });

            $(document).on("click", ".btn-fwidth", function () {
                $('#home_wrapper').css('width', $(this).data('width'));

                btnElement = $(this);
                $('.btn-fwidth').removeClass('active');
                $(this).addClass('active');
                //reset    
                if ($(this).hasClass('width-default')) {
                    $globalthis.windowWidth = $(window).width();
                    $('#home_wrapper').attr('class', 'default');
                } else {
                    $('#home_wrapper').attr('class', 'col-' + $globalthis.returnWidthClass(parseInt($(this).data('width'))));
                    $globalthis.windowWidth = $(this).data('width');
                }
                classVal = $globalthis.returnWidthClass();
                $(".column-row", $('#home_wrapper')).each(function () {
                    valueFra = $(this).data("form")[classVal];
                    $(".apbtn-width .width-val", $(this)).attr("class", "width-val ap-w-" + valueFra.toString().replace(".", "-"));
                });
                $globalthis.initColumnSetting();
            });

            $(document).on("click", ".btn-import", function () {
                $("#ap_loading").show();
                var url = $globalthis.ajaxHomeUrl + '&ajax=1&action=showImportForm&idProfile=' + $globalthis.profileId;
                var data = '';
                $.ajax({
                    type: 'POST',
                    headers: {"cache-control": "no-cache"},
                    url: url,
                    async: true,
                    data: data,
                    dataType: 'json',
                    cache: false,
                    success: function (json)
                    {
                        $("#ap_loading").hide();
                        if (json && json.hasError == true){
                            alert(json.errors);
                        }else{
                            $("#txt-search").hide();
                            $('#myModalLabel').html($('#myModalLabel').data('addnew'));
							//fix bug prestashop 1.7.6.2 can not get address_token
							if (typeof address_token === "undefined") {
								var match = RegExp('[?&]' + 'token' + '=([^&]*)').exec(window.location.search);
								address_token = match && decodeURIComponent(match[1].replace(/\+/g, ' '));                                                      
							}
                            $('#modal_form .modal-body').html(json.result);
                            $('#modal_form .modal-footer').hide();
                            $('#modal_form').modal('show');
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        $("#ap_loading").hide();
                        alert("TECHNICAL ERROR: \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);
                    }
                });
            });

            $(document).on("click", ".btn-export", function () {
                var objects = new Object();
                type = $(this).data("type");
                var position = '';
                if (type == "group") {
                    objHook = {};
                    objHook.groups = {};
                    objHook.groups[0] = $globalthis.getHookSubmit($(this).closest('.group-row'));
                    objects[0] = objHook;
                } else if (type == "position") {
                    position = $(this).data("position");
                    type = "position-" + position;
                    var id = "#position-" + $(this).data("position") + " .hook-wrapper";
                    $(id).each(function (iHook) {
                        //hook object contain group
                        var objHook = {};
                        objHook.name = $(this).data('hook');
                        objHook.position = $(this).data('hook');
                        objHook.groups = {};
                        $('.group-row', $(this)).each(function (iGroup) {
                            objHook.groups[iGroup] = $globalthis.getHookSubmit(this);
                        });

                        objects[iHook] = objHook;
                    });
                } else if (type == "all") {
                    $('.hook-wrapper').each(function (iHook) {
                        //hook object contain group
                        var objHook = {};
                        objHook.name = $(this).data('hook');
                        objHook.position = $(this).data('hook');
                        objHook.groups = {};
                        $('.group-row', $(this)).each(function (iGroup) {
                            objHook.groups[iGroup] = $globalthis.getHookSubmit(this);
                        });

                        objects[iHook] = objHook;
                    });
                } else {
                    objHook = {};
                    objHook.groups = {};
                    $('.group-row', $('.' + type)).each(function (iGroup) {
                        objHook.groups[iGroup] = $globalthis.getHookSubmit(this);
                    });
                    objects[0] = objHook;
                }

                data = 'dataForm=' + JSON.stringify(objects);

                $("#ap_loading").show();
                url = $globalthis.ajaxHomeUrl + '&action=export&type=' + type;

                $.ajax({
                    type: 'POST',
                    headers: {"cache-control": "no-cache"},
                    url: url,
                    async: true,
                    cache: false,
                    data: data,
                    dataType: 'json',
                    cache: false,
                    success: function (json)
                    {
                        $("#ap_loading").hide();
                        if (json && json.hasError == true){
                            alert(json.errors);
                        }else{
                            if (type == 'all')
                                type = 'appagebuilderhome';
                            $globalthis.downloadFile(type + '.xml', json.result);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        $("#ap_loading").hide();
                        alert("TECHNICAL ERROR: \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);
                    }
                });
            });

            //delete group
            $(document).on("click", ".btn-delete", function () {
                if (!confirm($("#form_content").data("delete")))
                    return false;

                // Deleta a panel
                if ($(this).hasClass("tabcontent-action") && $(this).hasClass("accordions")) {
                    // Check this must be have greater than 2 accordions
                    var cover = $(this).closest(".panel-group");
                    if ($(cover).find(".panel").length < 3) {
                        alert("Can not delete when have 2 panel");
                        return;
                    }

                    // remove
                    if ($(this).closest('.panel-default').length > 0) {
                        $(this).closest('.panel-default').remove();
                        return;
                    }
                }

                // Deleta tab
                if ($(this).hasClass("tabcontent-action") && $(this).hasClass("tab")) {
                    // Check this must be have greater than 2 tabs
                    var tabcontent = $(this).closest(".tab-content");
                    var limit = $(tabcontent).find("#default_tabcontent").length > 0 ? 4 : 3;
                    if ($(tabcontent).find(".tab-pane").length < limit) {
                        alert("Can not delete when have " + (limit - 1) + " tabs");
                        return;
                    }

                    // remove
                    tabId = $(this).closest(".tab-pane").attr('id');
                    $('a[href$="' + tabId + '"]:first()').closest("li").remove();
                    $("#" + tabId).remove();
                    return;
                }

                if ($(this).hasClass("accordions")) {
                    if ($(this).closest('.panel-default').length > 0) {
                        $(this).closest('.panel-default').remove();
                    }
                }

                if ($(this).data("for") == undefined) {
                    if ($(this).hasClass("group-action")) {
                        $(this).closest(".group-row").remove();
                    } else if ($(this).hasClass("column-action")) {
                        $(this).closest(".column-row").remove();
                    } else {
                        // Delete group of tag, accordion
                        $(this).closest(".widget-row").remove();
                    }
                }
                else {
                    $(this).closest($(this).data("for")).remove();
                }

            });

            //edit group
            $(document).on("click", ".btn-edit", function () {
                if (typeof $(this).data('type') == 'undefined') {
                    var type = $(this).closest('.widget-row').data("type");
                }else
                    var type = $(this).data("type");

                if (type.indexOf("apSub") == 0) {
                    if (type == "apSubAccordions") {
                        idContainer = $(this).closest('.widget-container-content').attr("id");
                    } else {
                        idContainer = $(this).closest('.widget-wrapper-content').attr("id");
                    }
                    type = type.replace("Sub", "") + "&subTab";
                    $globalthis.currentElement = $('a[href*="' + idContainer + '"]', $(this).closest(".widget-row"));
                } else {
                    if ($(this).data('for') == undefined) {
                        if (type == "ApRow") {
                            $globalthis.currentElement = $(this).closest(".group-row");
                        } else if (type == "ApColumn") {
                            $globalthis.currentElement = $(this).closest(".column-row");
                        } else {
                            $globalthis.currentElement = $(this).parent().parent();
                        }
                    }
                    else
                        $globalthis.currentElement = $(this).closest($(this).data('for'));
                }
                var url = $globalthis.ajaxShortCodeUrl;
                if (type === "apModule") {
                    url += '&ajax=1&edit&type_shortcode=any&type=module';
                } else if (type === "ApRow") {
                    var hook_name = $(this).closest("[data-hook]").attr('data-hook');
                    url += '&ajax=1&edit&type_shortcode=' + type + "&type=widget" + "&id_appagebuilder_profiles=" + $globalthis.profileId + "&hook_name=" + hook_name;
                } else {
                    url += '&ajax=1&edit&type_shortcode=' + type + "&type=widget";
                }
                var obj = $($globalthis.currentElement).data("form");

                var data = '';
                if (obj)
                    Object.keys(obj).forEach(function (key) {
                        //if value is url
                        vkey = obj[key];
                        if((obj[key]+'').indexOf('//') >= 0){
                            vkey = vkey.replace("%2F", "_AP2F_");
                        }
                        data += (data ? "&" : "") + key + "=" + vkey;
                    });
                $("#txt-search").hide();
                $("#ap_loading").show();

                // Store parent id
                if (type == "apSubAccordions" || type == "apAccordions&subTab") {
                    $globalthis.parentId = $(this).closest(".panel-group").attr("id");
                }
                $.ajax({
                    type: 'POST',
                    headers: {"cache-control": "no-cache"},
                    url: url,
                    async: true,
                    cache: false,
                    data: data,
                    success: function (data) {
                        data = data.replace(/_APNEWLINE_/g, "&#10;");
                        $("#ap_loading").hide();
                        $('#myModalLabel').html($('#myModalLabel').data('edit') + " " + type.replace('ap_', ''));
						//fix bug prestashop 1.7.6.2 can not get address_token
                        if (typeof address_token === "undefined") {
                            var match = RegExp('[?&]' + 'token' + '=([^&]*)').exec(window.location.search);
                            address_token = match && decodeURIComponent(match[1].replace(/\+/g, ' '));                                                      
                        }
                        $('#modal_form .modal-footer').show();
                        $('#modal_form .modal-body').html(data);
                        $('#modal_form').removeClass('modal-new').addClass('modal-edit');
                        
                        // FIX BUG : ApCategory khong save duoc icon cu, khi thay icon cho 1 category khac
//                        resetSelectedImage();


                        //$('#modal_form').modal('show');
                        $("#modal_form").modal({
                            "backdrop": "static"
                        });
                        if (type == "ApFullSlider" || type == "ApBlockCarousel") {
                            initFullSlider("edit");
                        }
                        if (type == "ApBlockLink") {
                            $globalthis.initBlockLink("edit");
                        }
                        if (type == "ApCounter") {
                            $globalthis.initCounter("edit");
                        }

                        hideFormLevel2();
                        
                        $globalthis.setFormAction();
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        $("#ap_loading").hide();
                        alert("TECHNICAL ERROR: \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);
                    }
                });
            });
            
            $(document).on("click", ".btn-new-widget", function () {
                var url = $globalthis.ajaxHomeUrl + '&ajax=1&action=renderList';
                if ($(this).hasClass('tabcontent-action'))
                {
                    url += '&subTab=1'
                }
                if ($(this).hasClass('reload-module'))
                {
                    url += '&reloadModule=1'
                }
                var data = '';
                if ($(this).hasClass('column-action')) {
                    $globalthis.currentElement = $(this).closest('.column-row').find('.column-content').first();
                } else if ($(this).hasClass('tabcontent-action')) {
                    if ($(this).hasClass('accordion'))
                        $globalthis.currentElement = $(this).closest('.panel-collapse').find('.subwidget-content').first();
                    else
                        $globalthis.currentElement = $(this).closest('.tab-pane').find('.subwidget-content').first();
                } else {
                    $globalthis.currentElement = $(this).closest('.hook-content-footer');
                }
                $("#ap_loading").show();

                $.ajax({
                    type: 'POST',
                    headers: {"cache-control": "no-cache"},
                    url: url,
                    async: true,
                    data: data,
                    dataType: 'json',
                    cache: false,
                    success: function (json) {
                        $("#ap_loading").hide();
						//fix bug prestashop 1.7.6.2 can not get address_token
                        if (typeof address_token === "undefined") {
                            var match = RegExp('[?&]' + 'token' + '=([^&]*)').exec(window.location.search);
                            address_token = match && decodeURIComponent(match[1].replace(/\+/g, ' '));                                                      
                        }
                        if (json && json.hasError == true){
                            alert(json.errors);
                        }else{
                            $("#txt-search").show();
                            $('#myModalLabel').html($('#myModalLabel').data('addnew'));
                            $('#modal_form .modal-body').html(json.result);
                            $('#modal_form .modal-footer').hide();
                            $('#modal_form').modal('show');
                            $('#modal_form').removeClass('modal-edit').addClass('modal-new');
                            $globalthis.setFormAction();
                            $("#txt-search").focus();
                            $globalthis.initIsotopAction();
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        $("#ap_loading").hide();
                        alert("TECHNICAL ERROR: \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);
                    }
                });
            });
            $("#modal_form").on('shown.bs.modal', function () {
                $("#txt-search").focus();
            })

            $(document).on("click", ".btn-status", function () {
                if ($(this).data("for") == undefined) {
                    if ($(this).hasClass("group-action")) {
                        $globalthis.currentElement = $(this).closest(".group-row");
                    } else if ($(this).hasClass("column-action")) {
                        $globalthis.currentElement = $(this).closest(".column-row");
                    } else {
                        $globalthis.currentElement = $(this).closest(".widget-row");
                    }
                }
                else
                    $globalthis.currentElement = $(this).closest($(this).data("for"));
                objForm = $globalthis.currentElement.data("form");

                if ($(this).hasClass("deactive")) {
                    $(this).removeClass("deactive").addClass("active");
                    objForm.active = 1;
                    $(this).children().removeClass("icon-remove");
                    $(this).children().addClass("icon-ok");
                } else {
                    $(this).removeClass("active").addClass("deactive");
                    objForm.active = 0;
                    $(this).children().addClass("icon-remove");
                    $(this).children().removeClass("icon-ok");
                    // icon-remove
                }
                
                if ($($globalthis.currentElement).hasClass("deactive")) {
                    $($globalthis.currentElement).removeClass("deactive").addClass("active");
                }else{
                    $($globalthis.currentElement).removeClass("active").addClass("deactive");
                }
                
                objForm = $globalthis.currentElement.data('form', objForm);
            });

            $(document).on("click", '.all-devicesd', function(){
                if ($(this).data("for") == undefined) {
                    if ($(this).closest(".column-row").length) {
                        $globalthis.currentElement = $(this).closest(".column-row");
                    } else {
                        $globalthis.currentElement = $(this).closest(".group-row");
                    }
                }else{
                    $globalthis.currentElement = $(this).closest($(this).data("for"));
                }
                objForm = $globalthis.currentElement.data("form");

                if($(this).hasClass("deactive")){
                    $(this).removeClass("deactive").addClass("active");
                    objForm.active = 1;
                    $(this).children().removeClass("icon-remove").addClass("icon-ok");
                    $(this).attr('data-original-title','Disable Group');
                }else{
                    $(this).removeClass("active").addClass("deactive");
                    objForm.active = 0;
                    $(this).children().removeClass("icon-ok").addClass("icon-remove");
                    $(this).attr('data-original-title','Enable Group');
                }
                if ($($globalthis.currentElement).hasClass("deactive")) {
                    $($globalthis.currentElement).removeClass("deactive").addClass("active");
                }else{
                    $($globalthis.currentElement).removeClass("active").addClass("deactive");
                }
                
                objForm = $globalthis.currentElement.data('form', objForm);
            });
            $(document).on("click", '.devicesd-active .btn-group', function(){
                if ($(this).data("for") == undefined) {
                    if ($(this).parent().hasClass("group-action")) {
                        $globalthis.currentElement = $(this).closest(".group-row");
                    } else if ($(this).parent().hasClass("column-action")) {
                        $globalthis.currentElement = $(this).closest(".column-row");
                    } else {
                        $globalthis.currentElement = $(this).closest(".widget-row");
                    }
                }else{
                    $globalthis.currentElement = $(this).closest($(this).data("for"));
                }
                objForm = $globalthis.currentElement.data("form");

                objForm.active_desktop = $globalthis.currentElement.hasClass("active-desktop") ? 1 : 0,
                objForm.active_tablet = $globalthis.currentElement.hasClass("active-tablet") ? 1 : 0,
                objForm.active_mobile = $globalthis.currentElement.hasClass("active-mobile") ? 1 : 0; 

                if($(this).attr('device') == 'desktop') {
                    if($(this).hasClass('deactive-desktop')){
                        $(this).removeClass("deactive-desktop").addClass("active-desktop");
                        objForm.active_desktop = 1;
                        $(this).children().css('opacity','1');
                        $(this).attr('data-original-title','Disable Group On Desktop');
                        $($globalthis.currentElement).removeClass("deactive-desktop").addClass("active-desktop");
                    }else{
                        $(this).removeClass("active-desktop").addClass("deactive-desktop");
                        objForm.active_desktop = 0;
                        $(this).attr('data-original-title','Enable Group On Desktop');
                        $($globalthis.currentElement).removeClass("active-desktop").addClass("deactive-desktop");
                    }
                } else if($(this).attr('device') == 'tablet') {
                    if($(this).hasClass('deactive-tablet')){
                        $(this).removeClass("deactive-tablet").addClass("active-tablet");
                        objForm.active_tablet = 1;
                        $(this).children().css('opacity','1');
                        $(this).attr('data-original-title','Disable Group On Tablet');
                        $($globalthis.currentElement).removeClass("deactive-tablet").addClass("active-tablet");
                    }else{
                        $(this).removeClass("active-tablet").addClass("deactive-tablet");
                        objForm.active_tablet = 0;
                        $(this).attr('data-original-title','Enable Group On Tablet');
                        $($globalthis.currentElement).removeClass("active-tablet").addClass("deactive-tablet");
                    }
                } else {
                    if($(this).hasClass('deactive-mobile')){
                        $(this).removeClass("deactive-mobile").addClass("active-mobile");
                        objForm.active_mobile = 1;
                        $(this).children().css('opacity','1');
                        $(this).attr('data-original-title','Disable Group On Mobile');
                        $($globalthis.currentElement).removeClass("deactive-mobile").addClass("active-mobile");
                    }else{
                        $(this).removeClass("active-mobile").addClass("deactive-mobile");
                        objForm.active_mobile = 0;
                        $(this).attr('data-original-title','Enable Group On Mobile');
                        $($globalthis.currentElement).removeClass("active-mobile").addClass("deactive-mobile");
                    }
                }

                objForm = $globalthis.currentElement.data('form', objForm);
            });

            $(document).on("click", ".leo-group-devicesd .leo-devicesd", function(){

                if($(this).hasClass('leo-active-devicesd')){
                    $(this).removeClass('leo-active-devicesd');
                }else{
                    $(".leo-group-devicesd .leo-devicesd").removeClass('leo-active-devicesd');
                    $(this).addClass('leo-active-devicesd');
                }
                if($(this).attr('data-original-title') == 'Show all'){
                    $('.group-row.deactive').removeClass('hidden');
                    $('.column-row.deactive').removeClass('hidden');
                    $('.widget-row.deactive').removeClass('hidden');
                    $('#home_wrapper').attr('class', 'default');
                    $('#home_wrapper').css('width', 'auto');
                }else{
                    $('.group-row.deactive').addClass('hidden');
                    $('.column-row.deactive').addClass('hidden');
                    $('.widget-row.deactive').addClass('hidden');
                    $('#home_wrapper').css('width', $(this).data('width'));
                    $('#home_wrapper').attr('class', 'col-' + $globalthis.returnWidthClass(parseInt($(this).data('width'))));
                }
                if($(this).hasClass('width-desktop')){
                    $('.width-tablet.leo-devicesd').attr('data-original-title','Show only on tablet');
                    $('.width-mobile.leo-devicesd').attr('data-original-title','Show only on mobile');
                    if ($(this).attr('data-original-title') == 'Show all'){
                        $('.deactive-desktop').removeClass('hidden');
                        $(this).attr('data-original-title','Show only on desktop');
                    }else{
                        $('.deactive-desktop').addClass('hidden');
                        $(this).attr('data-original-title','Show all');
                        $('.deactive-tablet').removeClass('hidden');
                        $('.deactive-mobile').removeClass('hidden');
                    }
                } else if($(this).hasClass('width-tablet')){
                    $('.width-desktop.leo-devicesd').attr('data-original-title','Show only on desktop');
                    $('.width-mobile.leo-devicesd').attr('data-original-title','Show only on mobile');
                    if ($(this).attr('data-original-title') == 'Show all'){
                        $('.deactive-tablet').removeClass('hidden');
                        $(this).attr('data-original-title','Show only on tablet');
                    }else{
                        $('.deactive-tablet').addClass('hidden');
                        $(this).attr('data-original-title','Show all');
                        $('.deactive-desktop').removeClass('hidden');
                        $('.deactive-mobile').removeClass('hidden');
                    }
                }else if($(this).hasClass('width-mobile')){
                    $('.width-tablet.leo-devicesd').attr('data-original-title','Show only on tablet');
                    $('.width-desktop.leo-devicesd').attr('data-original-title','Show only on desktop');
                    if ($(this).attr('data-original-title') == 'Show all'){
                        $('.deactive-mobile').removeClass('hidden');
                        $(this).attr('data-original-title','Show only on mobile');
                    }else{
                        $('.deactive-mobile').addClass('hidden');
                        $(this).attr('data-original-title','Show all');
                        $('.deactive-desktop').removeClass('hidden');
                        $('.deactive-tablet').removeClass('hidden');
                    }
                }
            });

            $(document).on("click", ".btn-change-colwidth", function () {
                cla = $globalthis.returnWidthClass();
                elementColumn = $(this).closest('.column-row');
                objColumn = $(elementColumn).data('form');

								valueColToNum = objColumn[cla].toString().replace("-", ".");
                val = $(this).data("value");
//                console.log(cla + '--' + valueColToNum + 'claa' + cla);
                if (val == 1 && parseFloat(valueColToNum) >= 12) {
                    alert($("#form_content").data("increase"));
                    return false;
                }
                if (val == -1 && parseFloat(valueColToNum) <= 1) {
                    alert($("#form_content").data("reduce"));
                    return false;
                }
                //get index of current width
                indexW = jQuery.inArray(valueColToNum.toString(), $globalthis.widthSupport);
                indexW = parseInt(indexW) + val;
                //get new width
                objColumn[cla] = $globalthis.widthSupport[indexW];
                //set class again
                classColumn = $globalthis.getClassColumn(objColumn);

                $(elementColumn).attr("class", classColumn);
                $(".apbtn-width .width-val", $(elementColumn)).attr("class", "width-val ap-w-" + objColumn[cla].toString().replace(".", "-"));
                $(elementColumn).data("form", objColumn);
                $globalthis.getNumberColumnInClass(elementColumn, $globalthis.returnWidthClass());
                return false;
            });

            $(document).on("click", ".change-colwidth", function () {
                cla = $globalthis.returnWidthClass();
                width = $(this).data('width');
                elementColumn = $(this).closest('.column-row');
                objColumn = $(elementColumn).data('form');
                //get new width
                objColumn[cla] = width;
                //set class again
                classColumn = $globalthis.getClassColumn(objColumn);

                $(elementColumn).attr("class", classColumn);
                $(".apbtn-width .width-val", $(elementColumn)).attr("class", "width-val ap-w-" + objColumn[cla].toString().replace(".", "-"));
                $(elementColumn).data("form", objColumn);
                $(this).closest("ul").find("li").removeClass("selected");
                $(this).closest("li").addClass("selected");
                $globalthis.getNumberColumnInClass(elementColumn, $globalthis.returnWidthClass());
                return false;
            });


            $(document).on("click", ".btn-add-tab", function () {
                //nav-tabs tab-content
                widget = $(this).closest('.widget-row');
                tabID = "tab_" + $globalthis.getRandomNumber();

                tab = $("#default_tabnav").clone(1);
                tab.removeAttr("id");
                $(tab).find('a').attr('href', '#' + tabID);

                $(this).parent().before(tab);

                var ObjectTab = {form_id: "form_" + $globalthis.getRandomNumber()};
                ObjectTab.id = tabID;
                ObjectTab["css_class"] = "";
                ObjectTab["override_folder"] = "";
                titleTab = $.trim($(tab).find('a').html());
                Object.keys($globalthis.languages).forEach(function (key) {
                    ObjectTab["title_" + $globalthis.languages[key]] = titleTab;
                });
                $(tab).find('a').data("form", ObjectTab);

                tabContent = $("#default_tabcontent").clone(1);
                tabContent.attr('id', tabID);
                $('.tab-pane', $(widget)).removeClass('active');
                $(tabContent).addClass('active');
                $('.tab-content', $(widget)).append(tabContent);

                $(tab).tab('show');
                $(tab).trigger('click');
                $(tab).addClass('active');
                return false;
            });

            $(document).on("click", ".btn-add-accordion", function () {
                //nav-tabs tab-content
                panel = $(this).closest('.panel-group');
                //$('.panel-collapse', $(panel)).collapse();
                panelDefault = $(panel).find('.panel-default').first().clone();
                var parent = $(panel).find('.panel-default').first().find(".panel-title a").data("parent");
                collapseID = "collapse-" + $globalthis.getRandomNumber();
                $('.panel-title a', $(panelDefault)).html('New Accordion');
                $('.panel-title a', $(panelDefault)).attr('href', "#" + collapseID);
                $('.panel-title a', $(panelDefault)).data("parent", parent.replace("#", ""));
                $('.panel-collapse', $(panelDefault)).attr('id', collapseID);
                $('.panel-collapse .subwidget-content', $(panelDefault)).html('');

                ObjectForm = $globalthis.assignDataForm($(panel).find('.panel-default').first().find(".panel-title a"), collapseID);
                //ObjectForm = $globalthis.assignDataForm($('.panel-title a',$(panelDefault)), collapseID);
                // var ObjectForm = {form_id:"form_"+$globalthis.getRandomNumber()};
                // ObjectForm['parent_id'] = parent;
                // ObjectForm['id'] = collapseID;
                // ObjectForm['title_1'] = 'New Accordion';
                ObjectForm['title_' + $globalthis.lang_id] = "New Accordion";
                $('.panel-title a', $(panelDefault)).data('form', ObjectForm);
                $(this).before(panelDefault);
            });

            $(document).on("click", ".btn-duplicate", function () {
                parent = $(this).parent().parent();
                //dublicate widget
                if ($(parent).hasClass('widget-row')) {
                    if ($(this).hasClass('widget-action')) {
                        duplicate = $(parent).clone(1);
                        ObjectForm = $globalthis.assignDataForm(duplicate);
                        $(duplicate).data('form', ObjectForm);
                        $(parent).parent().append(duplicate);
                    }
                }

                //duplicate accordion
                if ($(parent).hasClass('panel-body')) {
                    panel = $(parent).closest('.panel').clone(1);
                    panelGroup = $(parent).closest('.panel-group');
                    $globalthis.changWidgetFormID(panel);
                    $globalthis.changeAccordionPanel(panel);

                    $(panelGroup).parent().find('.btn-add-accordion').before(panel);
                }

                //duplicate accordions
                if ($(parent).hasClass("ApAccordions")) {
                    widgetRow = $(parent).clone(1);
                    accId = "accordion_" + $globalthis.getRandomNumber();
                    ObjectForm = $globalthis.assignDataForm(widgetRow, accId);

                    $(widgetRow).data('form', ObjectForm);
                    $(widgetRow).attr('id', accId);
                    $(widgetRow).attr('class', 'widget-row ApAccordions ' + $globalthis.classWidget + ' ' + ObjectForm.form_id);

                    $globalthis.changWidgetFormID(widgetRow);
                    $globalthis.changeAccordionPanel(widgetRow, accId);

                    $(parent).closest('.column-content').append(widgetRow);
                }

                //duplicate tab
                if ($(parent).hasClass('tab-pane')) {
                    widgetRow = $(parent).closest('.widget-row');
                    //duplicate tab content
                    tabContent = $(parent).clone(1);
                    tabId = "tab_" + $globalthis.getRandomNumber();
                    $globalthis.changWidgetFormID(tabContent);
                    hrefOld = "#" + tabContent.attr('id');
                    $(tabContent).attr('id', tabId);
                    $(parent).closest('.tab-content').append(tabContent);
                    $('.tab-pane', $(parent).removeClass('active'));
                    $(tabContent).addClass('active');
                    $(parent).parent().append(tabContent);

                    //duplicate a
                    tabTile = $(widgetRow).find('a[href*="' + hrefOld + '"]').parent().clone(1);
                    tab = $(tabTile).find('a').first();
                    $(tab).attr('href', '#' + tabId);
                    ObjectForm = $globalthis.assignDataForm(tab, tabId);
                    $(tab).data('form', ObjectForm);

                    $(parent).closest('.widget-row').find('.tab-button').before(tabTile);

                    $(tab).tab('show');
                    $(tab).trigger('click');
                    $(tab).addClass('active');
                }

                //duplicate tabs
                if ($(parent).hasClass('ApTabs')) {
                    widgetRow = $(parent).clone(1);
                    ObjectForm = $globalthis.assignDataForm(widgetRow);
                    $(widgetRow).data('form', ObjectForm);
                    $(widgetRow).attr('class', 'widget-row ApTabs ' + $globalthis.classWidget + ' ' + ObjectForm.form_id);
                    $globalthis.changWidgetFormID(widgetRow);

                    $globalthis.changeTabs(widgetRow);

                    $(parent).closest('.column-content').append(widgetRow);
                }
                //duplicate column
                if ($(parent).hasClass('for-column-row')) {
                    var parentColumn = $(parent).closest(".column-row");
                    column = $(parentColumn).clone(1);
                    column = $globalthis.changeDatacolumn(column);
                    $(parentColumn).parent().append(column);
                }
                //duplicate group
                if ($(parent).hasClass('for-group-row')) {
                    var parentGroup = $(parent).closest(".group-row");
                    group = $(parentGroup).clone(1);
                    ObjectForm = $globalthis.assignDataForm(group);
                    $(group).data('form', ObjectForm);
                    $('.column-row', $(group)).each(function () {
                        $globalthis.changeDatacolumn(this);
                    });

                    $(parentGroup).parent().find('.hook-content-footer').before(group);
                }
                $('.label-tooltip', $($(parent).parent())).tooltip('disable');
                $('.tooltip', $($(parent).parent())).remove();
            });

            $(document).on("click", ".choose-img", function (e) {
                e.preventDefault();
                var link = $(this);
                // Store object image for hold the destination after select back
                imgId = $(link).data("for");
                $.ajax({
                    url: $(link).attr("href"),
                    beforeSend: function () {
                        $("#ap_loading").show();
                    },
                    success: function (response) {
						//fix bug prestashop 1.7.6.2 can not get address_token
                        if (typeof address_token === "undefined") {
                            var match = RegExp('[?&]' + 'token' + '=([^&]*)').exec(window.location.search);
                            address_token = match && decodeURIComponent(match[1].replace(/\+/g, ' '));                                                      
                        }
                        $("#modal_select_image .modal-body").html(response);
                        $("#modal_select_image .modal-body").css('min-height', $(window).height() * 0.8);
                        $("#modal_select_image").modal('show');
                        $(".img-link").tooltip();
                    },
                    complete: function () {
                        $("#ap_loading").hide();
                    }
                });
                return false;
            });
            $(document).on("click", ".selectImg.lang .reset-img", function (e) {
              e.preventDefault();

              $(this).closest('.translatable-field').find('.img-thumbnail').attr('src', '');
              $(this).closest('.translatable-field').find('.img-value').attr('value', '_JS_EMPTY_VALUE_');
              $(this).closest('.translatable-field').find('.img-thumbnail').hide();
              return false;
            });
            $(document).on("click", ".selectImg.lang .reset-allimg", function (e) {
              e.preventDefault();
              $(this).closest('.form-group').find('.img-thumbnail').attr('src', '');
              $(this).closest('.form-group').find('.img-value').attr('value', '_JS_EMPTY_VALUE_');
              $(this).closest('.form-group').find('.img-thumbnail').hide();
              return false;
            });

            
            $(document).on("click", ".image-manager .img-link", function (e) {
                e.stopPropagation();
                var img = $(this).find("img");
                $("#s-image").removeClass("hidden");
                var name = $(img).attr("src");
                $(imgId).val($(img).attr("data-name"));

                var div = $(imgId).closest("div");
                imgDest = $(div).find("img");
				
                var widget = $(img).attr("data-widget");
                if(widget == "ApImage360")
                {
                    // ADD code Image 360 : insert image to form
                    var idRow = 1;
                    var arr = $("#total_slider").val().split("|");
                    arr.sort(function(a, b) { return a - b; });
                    for(var i = 0; i < arr.length; i++) {
                        if(idRow != arr[i]) {
                            break;
                        }
                        idRow++;
                    }

                    var image_name = "image360_" +  idRow;
                    var html = '';
                    html += '<div class="col-lg-9">';
                    html += '    <div class="col-lg-5"><img data-position="" data-name="' +$(img).attr("data-name")+ '" class="img-thumbnail" src="' + name + '">';
                    html += '    <input type="hidden" value="' +$(img).attr("data-name")+ '" class="ApImage360" id="'+image_name+'" name="'+image_name+'"></div>';
                    html += '<div class="col-lg-4">'+$(img).attr("data-name")+'</div>';
                    html += '</div>';
                    html += '<div class="col-lg-3" style="text-align: right;">';
                    html += '    <button type="button" class="btn-delete-fullslider btn btn-danger"><i class="icon-trash"></i> Delete</button>';
                    html += '</div>';
                    $("#list-slider").append("<li id='" + idRow + "'>" + html + "</li>");
                    updateListIdFullSlider();
                }else{
                    if (imgDest.length > 0)
                    {
                        $(imgDest).attr("src", $(img).attr("src"));
                        $(imgDest).data("img", $(img).data("name"));
                        $(imgDest).show();
                        if ($(imgDest).attr("widget") === "ApCategoryImage"){
                            $(imgDest).closest(".list-image").find(".remove-img").removeClass("hidden");
                            $(imgDest).removeClass("hidden");
                            $(imgDest).attr("src-url", $(img).data("name"));
                            $(imgDest).data('img', $(img).attr("data-name"));
                            updateStatusCheck(imgDest);
                        }
                    }else{
                        $(div).prepend("<img src='" + $(img).attr("src") + "' class='img-thumbnail' data-img='" + $(img).attr("data-name") + "'/>");
                    }
                }

                $("#modal_select_image").modal('hide');
                return false;
            });
            $(document).on("click", ".remove-img", function (e) {
                e.stopPropagation();
                var img = $(this).closest(".list-image").find("img");
                $(img).attr("src-url", "");
                $(img).attr("src", "");
                $(img).addClass("hidden");
                $(this).parent().find('.image_link_cat').val("");
                updateStatusCheck(img);
            });
            $(".tree-folder-name input:checkbox").change(function () {
                $(this).find("input:checkbox").removeAttr("checked");
            });
			//DONGND:: add event for section select animation to group and column
			$(document).on("click", ".animation-button", function (e) {
				var animation_wrapper = $(this).siblings('.animation-wrapper');
				if (!$(this).hasClass('active'))
				{				
					$(".animation-button.active").siblings('.animation-wrapper').hide();
					$(".animation-button.active").removeClass('active');
					//DONGND:: load config by data				
					$(this).addClass('active');
					var animation_type = $(this).data('animation-type');
					var animation_delay = $(this).data('animation-delay');					
					var animation_duration = $(this).data('animation-duration');
					var animation_iteration_count = $(this).data('animation-iteration-count');
					var animation_infinite = $(this).data('animation-infinite');
					
					if (typeof animation_delay != 'undefined')
					{
						animation_wrapper.find('.animation_delay').val(animation_delay);
					}
					else
					{
						animation_wrapper.find('.animation_delay').val(1);
					}
					
					if (typeof animation_duration != 'undefined')
					{
						animation_wrapper.find('.animation_duration').val(animation_duration);
					}
					else
					{
						animation_wrapper.find('.animation_duration').val(1);
					}
					
					if (typeof animation_iteration_count != 'undefined')
					{
						animation_wrapper.find('.animation_iteration_count').val(animation_iteration_count);
					}
					else
					{
						animation_wrapper.find('.animation_iteration_count').val(1);
					}
									
					if (animation_infinite == 1)
					{
						animation_wrapper.find('.animation_infinite').attr( 'checked', 'checked' );
					}
					else
					{
						animation_wrapper.removeAttr('checked');
					}
					//DONGND:: change offset to right with column small					
					if ($(window).width()-$(this).offset().left < animation_wrapper.width())
					{
						animation_wrapper.addClass('offset-right');
					}
					animation_wrapper.show();
					
					if (typeof animation_type != 'undefined')
					{
						animation_wrapper.find('.animation_select').val(animation_type).trigger('change');	
					}
					else
					{
						animation_wrapper.find('.animation_select').val('none').trigger('change');	
					}
					
					// animation_wrapper.find('.animate-it').trigger('click');
										
				}
				else
				{
					$(this).removeClass('active');
					animation_wrapper.hide();
					animation_wrapper.removeClass('offset-right');
					animation_wrapper.find('.animationSandbox').removeClass().removeAttr('style').addClass('animationSandbox');
				}
				
			});
			
			//DONGND:: save config of animation to data form of column/group
			$(document).on("click", ".btn-save-animation", function (e) {
				var obj_parent = $(this).parents('.animation-wrapper');
				var animation_bt = obj_parent.siblings('.animation-button');
				var animation_type = obj_parent.find('.animation_select').val();
				var animation_delay = obj_parent.find('.animation_delay').val();
				var animation_duration = obj_parent.find('.animation_duration').val();
				var animation_iteration_count = obj_parent.find('.animation_iteration_count').val();
				var animation_infinite = obj_parent.find('.animation_infinite').is(':checked')? 1 : 0;
				
				$globalthis.assignConfigAnimation(animation_bt, animation_type, animation_delay, animation_duration, animation_iteration_count, animation_infinite);
				
				//DONGND:: update data form for group/column
				if (obj_parent.hasClass('column-animation-wrapper'))
				{				
					var main_obj = obj_parent.parents('.column-row');
					
				}
				if (obj_parent.hasClass('group-animation-wrapper'))
				{					
					var main_obj = obj_parent.parents('.group-row');
				}
				if (typeof main_obj != 'undefined')
				{
					main_obj.data('form').animation = animation_type;
					main_obj.data('form').animation_delay = animation_delay;
					main_obj.data('form').animation_duration = animation_duration;
					main_obj.data('form').animation_iteration_count = animation_iteration_count;
					main_obj.data('form').animation_infinite = animation_infinite;
				}
				
				animation_bt.trigger('click');
			});
			
			//DONGND:: hide section select animation for column and group when click out
			$(document).on("click", function (e) {
				if ($('.animation-button.active').length)
				{
					e.stopPropagation();
					var container = $('.animation-wrapper');
					var container2 = $('.animation-button');
										
					if (container.length && container.has(e.target).length === 0 && container2.has(e.target).length === 0 && !$(e.target).hasClass('animation-button') && !$(e.target).hasClass('animation-wrapper')) {						
						// container.hide();						
						// $('.animation-button.active').siblings('.animation-wrapper').find('.animationSandbox').removeClass().removeAttr('style').addClass('animationSandbox');
						// $('.animation-button.active').removeClass('active');	
						$('.animation-button.active').trigger('click');
					}
				}			
			});
			
			//DONGND:: active button for section select animation for column and group
			$(document).on("change", '.animation_select', function (e) {
				var wrapper_obj = $(this).parents('.animation-wrapper');
				if ($(this).val() == "none") {
					wrapper_obj.find('.animate_sub').hide();
				} else {
					wrapper_obj.find('.animate_sub').show();
					var duration_time = wrapper_obj.find('.animation_duration').val();
					var delay_time = wrapper_obj.find('.animation_delay').val();
					if (wrapper_obj.find('.animation_infinite').is(':checked'))
					{
						var iteration_number = 'infinite';
					}
					else
					{
						var iteration_number = wrapper_obj.find('.animation_iteration_count').val();
					}					
					
					wrapper_obj.find('.animationSandbox').removeClass().removeAttr('style').attr('style','animation-duration: '+duration_time+'s; animation-delay: '+delay_time+'s; animation-iteration-count: '+iteration_number).addClass($(this).val() + ' animated animationSandbox').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
						$(this).removeClass().removeAttr('style').addClass('animationSandbox');
					});
				}
			});
			
			//DONGND:: run demo with current config
			$(document).on("click", '.animate-it', function (e) {
				var wrapper_obj = $(this).parents('.animation-wrapper');
				wrapper_obj.find('.animation_select').trigger('change');
			});
			
			//DONGND:: copy to clipboard
			$(document).on("click", '.bt_copy_clipboard', function (e) {							
				var text_copy = '';
				
				if ($(this).hasClass('shortcode_key'))
				{
					text_copy = $('#shortcode_key').val();
				};
				if ($(this).hasClass('shortcode_embedded_hook'))
				{
					text_copy = $('#shortcode_embedded_hook').val();
				};
				if ($(this).hasClass('shortcode_embedded_code'))
				{
					text_copy = $('#shortcode_embedded_code').val();
				};
				
				if (text_copy != '')
				{
					var $temp = $("<input>");
					$("body").append($temp);			
					$temp.val(text_copy).select();
					document.execCommand("copy");
					showSuccessMessage('Copy successful');
					$temp.remove();
				}
			});	
                        
                        $(document).on("change", '#configuration_form.form_ApInstagram #access_token', function (e) {
                            var input_length = $(this).closest('.form_ApInstagram').find('#access_token').length;
                            var input_value = $(this).closest('.form_ApInstagram').find('#access_token').val();
                            if(input_length)
                            {
                                if (input_value)
                                {
                                    $('.refresh_instagram_label').html('The link to refresh Access Token (expire in 59 days)');
                                    $('.refresh_instagram_link').html('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + input_value);
                                    //alert('Run this link before Token Expire (60 days) https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + input_value);
                                }else{
                                    $('.refresh_instagram_label').html('Please type Access Token.');
                                    $('.refresh_instagram_link').html('');
                                }
                            }
                            else
                            {
                                alert('Not exist Instagram Token Input.');
                                $('.refresh_instagram_label').html('Not exist Access Token Input.');
                                $('.refresh_instagram_link').html('');
                            }
                        });
                        
                        $(document).on("click", '#leotheme_token_demo', function (e) {
                            $("#ap_loading").show();
                            $.ajax({
                                type: 'GET',
                                headers: {"Access-Control-Allow-Origin": "*"},
                                url: '//demo1.leotheme.com/instagram.php?get_token=1',
                                dataType: 'jsonp',
                                crossOrigin: true,
                                async: true,
                                cache: false,
                                jsonpCallback: 'callbackInstagramToken',
                                error: function (XMLHttpRequest, textStatus, errorThrown) {
//                                    alert("ERROR: \n\n Details:\n" + errorThrown);
//                                    $("#ap_loading").hide();
                                },
                                complete: function () {
                                    $("#ap_loading").hide();
                                }
                            });
                            window.callbackInstagramToken = function(json) {
                                if (json && json.token){
                                    $('.form_ApInstagram #access_token').val(json.token);
                                }
                                $('#configuration_form.form_ApInstagram #access_token').trigger('change');
                                $("#ap_loading").hide();
                            }
                            
                        });
        };
		
		//DONGND:: assign config to data form column/group
		this.assignConfigAnimation = function (obj_bt, data_type, data_delay, data_duration, data_iteration, data_infinite) {		
			obj_bt.data('animation-type', data_type);
			obj_bt.data('animation-delay', data_delay);
			obj_bt.data('animation-duration', data_duration);
			obj_bt.data('animation-iteration-count', data_iteration);
			obj_bt.data('animation-infinite', data_infinite);
			var txt_default = obj_bt.find('.animation-status').data('text-default');
			if (data_type != 'none')
			{				
				obj_bt.addClass('btn-success');							
				var txt_infinite = obj_bt.find('.animation-status').data('text-infinite');
				obj_bt.find('.animation-status').text(data_type + (data_infinite == 1 ? ' ('+txt_infinite+')' : ''));
			}
			else
			{
				obj_bt.removeClass('btn-success');
				obj_bt.find('.animation-status').text(txt_default);
			}
		};

        this.changeDatacolumn = function (column) {
            var $globalthis = this;
            ObjectForm = $globalthis.assignDataForm(column);
            $(column).data('form', ObjectForm);
            $('.widget-row', $(column)).each(function () {
                widgetRow = $(this);
                if ($(this).hasClass('ApAccordions')) {
                    accId = "accordion_" + $globalthis.getRandomNumber();
                    ObjectForm = $globalthis.assignDataForm(widgetRow, accId);

                    $(widgetRow).data('form', ObjectForm);
                    $(widgetRow).attr('id', accId);
                    $(widgetRow).attr('class', 'widget-row ApAccordions ' + $globalthis.classWidget + ' ' + ObjectForm.form_id);

                    $globalthis.changeAccordionPanel(widgetRow, accId);
                } else {
                    ObjectForm = $globalthis.assignDataForm(widgetRow);
                    $(widgetRow).data('form', ObjectForm);

                    if ($(this).hasClass('ApTabs')) {
                        $(widgetRow).attr('class', 'widget-row ApTabs ' + $globalthis.classWidget + ObjectForm.form_id);
                        $globalthis.changeTabs(widgetRow);
                    }
                }
            });

            return column;
        };
        this.returnWidthClass = function (width) {
            $globalthis = this;
            if (!width)
                width = $globalthis.windowWidth;
            if (parseInt(width) >= 1200)
                return 'xl';
            if (parseInt(width) >= 992)
                return 'lg';
            if (parseInt(width) >= 768)
                return 'md';
            if (parseInt(width) >= 576)
                return 'sm';
            if (parseInt(width) >= 480)
                return 'xs';
            if (parseInt(width) < 480)
                return 'sp';
        };
        this.getClassColumn = function (objCol) {
            $globalthis = this;
            classColumn = 'column-row ' + $globalthis.classWidget;
            for (ic = 0; ic < $globalthis.arrayCol.length; ic++) {
                if (objCol[$globalthis.arrayCol[ic]]) {
                    valueCol = objCol[$globalthis.arrayCol[ic]];
                    if (valueCol.toString().indexOf(".") != -1) {
                        valueCol = valueCol.toString().replace(".", "-");
                    }
                    classColumn += " col-" + $globalthis.arrayCol[ic] + "-" + valueCol;
                }
            }
            return classColumn;
        };
        this.changWidgetFormID = function (panel) {
            var $globalthis = this;
            $('.widget-row', $(panel)).each(function () {
                var ObjectForm = {form_id: "form_" + $globalthis.getRandomNumber()};
                dataForm = $(this).data("form");
                Object.keys(dataForm).forEach(function (key) {
                    if (key != 'form_id')
                        ObjectForm[key] = dataForm[key];
                });

                $(this).data('form', ObjectForm);
            });
        };
        this.assignDataForm = function (element, id) {
            var $globalthis = this;
            dataForm = $(element).data("form");
            var ObjectForm = {form_id: "form_" + $globalthis.getRandomNumber()};
            Object.keys(dataForm).forEach(function (key) {
                if (key != 'form_id') {
                    if (id && key == 'id')
                        ObjectForm[key] = id;
                    else
                        ObjectForm[key] = dataForm[key];
                }
            });
            return ObjectForm;
        };
        this.changeTabs = function (widget) {
            var $globalthis = this;
            $('.widget-container-heading li a', $(widget)).each(function () {
                if ($(this).parent().attr("id") != "default_tabnav" && !$(this).parent().hasClass("tab-button")) {
                    OldHref = $(this).attr('href').replace('#', '');
                    tabID = "tab_" + $globalthis.getRandomNumber();
                    $(this).attr('href', "#" + tabID);
                    ObjectForm = $globalthis.assignDataForm(this, tabID);
                    $(this).data('form', ObjectForm);
                    $(widget).find('.tab-pane').each(function () {
                        if ($(this).attr('id') == OldHref) {
                            $(this).attr('id', tabID);
                            return false;
                        }
                    });

                    accId = "accordion_" + $globalthis.getRandomNumber();
                    ObjectForm = $globalthis.assignDataForm(widgetRow, accId);

                    $(widgetRow).data('form', ObjectForm);
                    $(widgetRow).attr('id', accId);
                    $(widgetRow).attr('class', 'widget-row ApAccordions ' + $globalthis.classWidget + ' ' + ObjectForm.form_id);

                    $globalthis.changWidgetFormID(widgetRow);
                    $globalthis.changeAccordionPanel(widgetRow, accId);
                }
            });
        };
        this.changeAccordionPanel = function (panel, accId) {
            var $globalthis = this;
            $('.panel-title a', $(panel)).each(function () {
                newHref = "collapse_" + $globalthis.getRandomNumber();
                ObjectForm = $globalthis.assignDataForm($(this), newHref);
                if (accId) {
                    ObjectForm.parent_id = accId;
                    $(this).data('parent', '#' + accId);
                }
                $(this).data('form', ObjectForm);
                $(this).attr('class', ObjectForm.form_id);
                oldHref = $(this).attr('href').replace('#', '');

                $(this).attr('href', '#' + newHref);

                $(panel).find('.panel-collapse').each(function () {
                    if ($(this).attr('id') == oldHref) {
                        $(this).attr('id', newHref);
                        return false;
                    }
                });
            });
        };
        this.getRandomNumber = function () {
            return (+new Date() + (Math.random() * 10000000000000000)).toString().replace('.', '');
        };
        this.testAnim = function (x) {
            $('#animationSandbox').removeClass().addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                $(this).removeClass();
            });
        };
        // AJAX LOAD FORM, LOAD WIDGET
        this.setFormAction = function () {
            var $globalthis = this;		
				
			//DONGND:: slick custom enable/disable	
			$('#slick_custom_status').change(function(){			
				if($(this).val() == 1)
				{					
					$('#slick_custom').parents('.form-group').show();
				}
				else
				{					
					$('#slick_custom').parents('.form-group').hide();
				}
			});	
			
			
			//DONGND:: slick center mode enable/disable
			$('#slick_centermode').change(function(){			
				if($(this).val() == 1)
				{					
					$('#slick_centerpadding').parents('.form-group').show();
				}
				else
				{					
					$('#slick_centerpadding').parents('.form-group').hide();
				}
			});	
			
            $('.form-action').change(function () {
                var elementName = $(this).attr('name');
                $('.' + elementName + '_sub').hide();
                $('.' + elementName + '-' + $(this).val()).show();
				
				//DONGND:: special fields of slick carousel
				if ($(this).val() == 'slickcarousel')
				{										
					$('#slick_custom_status').trigger('change');
					$('#slick_centermode').trigger('change');
				}
            });	
									      
            // Show tool tip, hint of label
            $("#modal_form .label-tooltip").tooltip();

            if ($('select[name="bg_config"]').length) {

                $('select[name="bg_config"]').change(function () {
                    if ($(this).val() == "fullwidth") {
                        if ($("#container").val() == "") {

                            bgType = $('select[name="bg_type"] option');
                            bgType.prop('selected', false);
                            bgType.find('option[value="normal"]').prop('selected', true);

                            $('select[name="bg_type"] option').each(function () {
                                if ($(this).val() != "normal" && $(this).val() != "fixed")
                                    $(this).attr('disabled', 'disabled');
                            });
                        } else {
                            $('select[name="bg_type"] option').each(function () {
                                if ($(this).val() != "normal" && $(this).val() != "fixed")
                                    $(this).removeAttr('disabled', 'disabled');
                            });
                        }
                    } else {
                        $('select[name="bg_type"] option').each(function () {
                            if ($(this).val() != "normal" && $(this).val() != "fixed")
                                $(this).removeAttr('disabled', 'disabled');
                        });
                    }
                });
                $("#container").change(function () {
                    $('select[name="bg_config"]').trigger("change");
                })
                $('select[name="bg_config"]').trigger("change");
            }

            $('.checkbox-group').change(function () {
                $globalthis.showOrHideCheckBox($(this));
            });

            $('.width-select').click(function () {
                btnGroup = $(this).closest('.btn-group');
                spanObj = $('.width-val', $(this));
                width = $(spanObj).data('width');
                $('.col-val', $(btnGroup)).val(width);
                $('.apbtn-width .width-val', $(btnGroup)).html($(spanObj).html());
                $('.apbtn-width .width-val', $(btnGroup)).attr('class', $(spanObj).attr('class'));
            });
            if ($('.aptab-config').length > 0) {
                //set tab aciton
                $('.aptab-config').each(function () {
                    if (!$(this).parent().hasClass('active')) {
                        element = $(this).attr('href').toString().replace("#", ".");
                        $(element).hide();
                    }
                });

                $('.aptab-config').click(function () {
                    divElement = $(this).attr('href').toString().replace("#", ".");
                    aElement = $(this);
                    $('.aptab-config').each(function () {
                        if ($(this).parent().hasClass('active')) {
                            element = $(this).attr('href').toString().replace("#", ".");
                            $(this).parent().removeClass('active');
                            $(element).hide();
                            return false;
                        }
                    });
                    $(divElement).show();
                    $(aElement).parent().addClass('active');

                    $('.form-action', $(divElement)).each(function () {
                        $(this).trigger("change");
                    });

                    $('.checkbox-group', $(divElement)).each(function () {
                        $globalthis.showOrHideCheckBox($(this));
                    });


                    // if ($(this).attr('href') == "#aprow_animation" && $('#animation').length > 0)
                        // $('#animation').trigger("change");

                });
            }

            if ($('.em_text').length > 0) {
                //page in column form
                $('.em_text').change(function () {
                    var list = $(this).closest('.well').find('.em_list');
                    var values = "";
                    if ($(this).val())
                        values = $(this).val().split(',');
                    var len = values.length;

                    list.find('option').prop('selected', false);
                    for (var i = 0; i < len; i++)
                        list.find('option[value="' + $.trim(values[i]) + '"]').prop('selected', true);
                });
                $('.em_list').change(function () {
                    if ($(this).val()) {
                        var str = $(this).val().join(', ');
                        var text = $(this).closest('.well').find('.em_text');
                        $(text).val(str);
                    }
                });
            }

            if ($('#animation').length > 0) {
                $('#animation').after('<button type="button" class="btn btn-default animate-it animate_sub">Animate it</button>');
                $('.animate-it').click(function () {
                    $('#animation').trigger("change");
                });
                $('#animation').change(function () {
                    if ($(this).val() == "none") {
                        $('.animate_sub').hide();
                    } else {
                        $('.animate_sub').show();
                        $globalthis.testAnim($(this).val());
                    }
                });
            }

            if ($('.select-img').length > 0) {
                /*$('.select-img').click(function(){
                 $.fancybox.open([{
                 type: 'iframe',
                 href: $globalthis.imgController,
                 afterLoad: function () {
                 $globalthis.hideSomeElement();
                 //$('.fancybox-iframe').load( $this.hideSomeElement );
                 },
                 afterClose: function (event, ui) {
                 //location.reload();
                 }
                 }], {
                 padding: 10
                 });
                 return false;
                 });
                 */
            }

            if ($('.form-action').length > 0 || $('.checkbox-group').length) {
                if ($("#configuration_form .nav-tabs").length)
                    $("#configuration_form .nav-tabs li.active a").trigger("click");
                else {
                    $('.form-action').trigger("change");
                    $('.checkbox-group').each(function () {
                        $globalthis.showOrHideCheckBox($(this));
                    });
                }
            }

            if ($(".select-class").length) {
                $('.select-class').each(function(){
                    if($('.element_class').val().indexOf($(this).attr('data-value')) >= 0){
                        $(this).attr('checked','checked');
                    }
                });
                $(".select-class").click(function () {
                    if ($(this).is(':checked')) {
                        
                        $('.select-class').each(function() {
                            // REMOVE ALL CHECKBOX VALUE IN TEXT
                            var classChk = $(this).data("value");
                            input_text = $(this).closest('.well').find('.element_class').first().val();
                            // trim string
                            var input_text = input_text.replace(classChk, "");
                            input_text = input_text.split("  ").join(" ");
                            input_text = $.trim(input_text);

                            $(this).closest('.well').find('.element_class').first().val(input_text);
                        });

                        var classChk = $(this).data("value");
                        var elementText = $(this).closest('.well').find('.element_class').first();

                        // SET VALUE CHECKBOX TO TEXT
                        if ($(elementText).val().indexOf(classChk) == -1) {
                          if ($(elementText).val() != "") {
                            $(elementText).val($(elementText).val() + " " + classChk);
                          } else {
                            $(elementText).val(classChk);
                          }
                        }
                    } 
                });
                
                $(".chk-row").click(function () {
                    var classChk = $(this).data("value");
                    var elementText = $(this).closest('.well').find('.element_class').first();
                    if ($(elementText).val().indexOf(classChk) == -1) {
                        // NOT EXIST AND ADD
                          if ($(elementText).val() != "") {
                            $(elementText).val($(elementText).val() + " " + classChk);
                          } else {
                            $(elementText).val(classChk);
                          }
                    }else{
                        // EXIST AND REMOVE
                        var find = classChk;
                        var re = new RegExp(find, 'g');
                        var text = $(elementText).val();
                        text = text.replace(re, '');
                        $(elementText).val(text);
                    }
                });

                $(".element_class").change(function () {
                    elementChk = $(this).closest('.well').find('input[type=checkbox]');
                    classText = $(this).val();
                    $(elementChk).each(function () {
                        classChk = $(this).data("value");
                        if (classText.indexOf(classChk) != -1) {
                            if (!$(this).is(':checked'))
                                $(this).prop("checked", true);
                        } else {
                            $(this).prop("checked", false);
                        }
                    });
                });
                $(".element_class").trigger("change");
            }

            //$('.new-shortcode').click(function() {
            $(".cover-short-code").click(function () {
                var a = $(this).find("a");
                var tab = $(a).hasClass("module") ? "module" : "widget";
                $(".btn-back-to-list").attr("tab", tab);
                // Add widget
                url = $globalthis.ajaxShortCodeUrl + "&addnew&type_shortcode="
                        + $(a).data("type") + "&type=" + tab;

                data = "";
                $("#ap_loading").show();
                $.ajax({
                    type: 'POST',
                    headers: {"cache-control": "no-cache"},
                    url: url,
                    async: true,
                    cache: false,
                    data: data,
                    success: function (data) {
						//fix bug prestashop 1.7.6.2 can not get address_token
                        if (typeof address_token === "undefined") {
                            var match = RegExp('[?&]' + 'token' + '=([^&]*)').exec(window.location.search);
                            address_token = match && decodeURIComponent(match[1].replace(/\+/g, ' '));                                                      
                        }
                        $("#txt-search").hide();
                        $('#myModalLabel').html($('#myModalLabel').data('addnew'));
                        $("#ap_loading").hide();
                        $('#modal_form .modal-footer').show();
                        $('#modal_form .modal-body').html(data);
                        $('#myModalLabel').html($('#myModalLabel').html() + ' : ' + $('.modal-widget-title').html());
                        resetSelectedImage();
                        if ($(a).data("type") == "ApFullSlider" || $(a).data("type") == "ApBlockCarousel") {
                            initFullSlider("add");
                        }
                        if ($(a).data("type") == "ApBlockLink") {
                            $globalthis.initBlockLink("add");
                        }
                        if ($(a).data("type") == "ApCounter") {
                            $globalthis.initCounter("add");
                        }

                        hideFormLevel2();
                        $globalthis.setFormAction();
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        $("#ap_loading").hide();
                        alert("TECHNICAL ERROR: \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);
                    }
                });
            });
            if ($("#list-slider").length > 0) {
                $("#list-slider").sortable({accept: "div",
                    update: function () {
                        var listId = "";
                        var sep = "";
                        $("#list-slider li").each(function () {
                            var id = (typeof $(this).attr("id") != "undefined") ? $(this).attr("id") : "";
                            if (id) {
                                listId += sep + id;
                                sep = "|";
                            }
                        });
                        $("#total_slider").val(listId);
                    }
                });
            }
            //copy to other laguage
            $("#configuration_form .translatable-field").each(function(){
                // if(!$(this).find('.mce-tinymce').length)
                    $(this).find('.col-lg-2').append('<a href="javascript:void(0)" title="Click on it to copy text to other language" class="btn btn-success ap-copy-lang">Duplicate</a>');
            });
            $('#configuration_form .ap-copy-lang').click(function(){
                input = $(this).closest('.translatable-field').find('div').first().find('input').first();
                textarea = $(this).closest('.translatable-field').find('div').first().find('textarea').first();
                iframe = $(this).closest('.translatable-field').find('div').first().find('iframe').first();
                image = $(this).closest('.translatable-field').find('div').first().find('img').first();
                if (iframe.length){
                    var iframeContent = document.getElementById(iframe.attr('id')).contentWindow.document.body.innerHTML;
                }
                $(this).closest('.translatable-field').parent().closest('.form-group').find('.translatable-field').each(function(){
                    $(this).find('div').first().find('input').each(function(){
                        $(this).val($(input).val());
                    });

                    $(this).find('div').first().find('textarea').each(function(){
                        $(this).val($(textarea).val());
                    });
                    $(this).find('div').first().find('img').each(function(){
                        $(this).attr('src', $(image).attr('src'));
                        $(this).attr('data-img', $(image).attr('data-img'));
                    });
                    $(this).find('div').first().find('iframe').each(function(){
                        $(this).contents().find('body').html(iframeContent);
                    });
                    // if(image.length && $(this).find('.choose-img').length && $(this).find('img').length < 1) {
                    //     $(this).find('.choose-img').first().parent().append($(image));
                    // }
                })
            });
        };
        this.initControllInRow = function () {
            $globalthis = this;
            $('.btn-custom').popover({
                html: true,
                content: function () {
                    $globalthis.currentElement = $('.group-content', $(this).closest('.group-row'));
                    return $('#addnew-group-form').html();
                }
            });
            $('.btn-custom').on('shown.bs.popover', function () {
                $('.number-column').click(function () {
                    widthCol = $(this).data('width');
                    classActive = $globalthis.returnWidthClass();
                    realValue = widthCol.toString().replace('.', '-');
                    $('.column-row', $($globalthis.currentElement)).each(function () {
                        ObjColumn = $(this).data('form');
                        oldClass = ObjColumn[classActive].toString().replace('.', '-');
                        if (classActive == "md" || classActive == "lg" || classActive == "xl") {
                            classColumn = $(this).attr('class').replace('col-xl-' + oldClass, 'col-xl-' + realValue).replace('col-lg-' + oldClass, 'col-lg-' + realValue).replace('col-md-' + oldClass, 'col-md-' + realValue);
                            ObjColumn.md = ObjColumn.lg = ObjColumn.xl = widthCol;
                        } else {
                            classColumn = $(this).attr('class').replace('col-' + classActive + '-' + oldClass, 'col-' + classActive + '-' + realValue);
                            ObjColumn[classActive] = widthCol;
                        }

                        $(this).attr('class', classColumn);
                        $(this).data('form', ObjColumn);
                        $globalthis.getNumberColumnInClass(this, classActive);
                    });
                });
            });

            $('.btn-add-column').popover({
                html: true,
                content: function () {
                    $globalthis.currentElement = $('.group-content', $(this).closest('.group-row'));
                    return $('#addnew-column-form').html();
                }
            });
            $('.btn-add-column').on('shown.bs.popover', function () {
            });

            btn_new_widget_group('.btn-new-widget-group');

        }
        this.initIsotopAction = function () {
            var $containerWidget = $("#widget_container");
            var $containerModule = $("#module_container");
            var currentTab = "widget";
            // init
            $containerWidget.isotope({
                // options
                itemSelector: ".item",
                layoutMode: "fitRows"
            });
            $containerModule.isotope({
                // options
                itemSelector: ".item",
                layoutMode: "fitRows"
            });
            function searchWidget(search) {
                var tab = currentTab;
                //log(tab);
                //log(search);
                $("#modal_form .for-" + tab + " .btn").removeClass("is-checked");
                $("#modal_form .for-" + tab + " li:first-child .btn").addClass("is-checked");

                // Detect and search by name
                var container = (tab === "widget" ? $containerWidget : $containerModule);
                container.isotope({
                    filter: function () {
                        if (search === "") {
                            return true;
                        } else {
                            var label = $(this).find(".label").text().toLowerCase() + " "
                                    + $(this).find("small i").text().toLowerCase();
                            return label.search(search) !== -1;
                        }
                    }
                });
            }
            searchWidget($("#modal_form #txt-search").val().toLowerCase());

            $("#tab-new-widget").on("click", "a", function () {
                currentTab = $(this).attr("aria-controls");
                var search = $("#txt-search").val().toLowerCase();
                var filterValue = $(".for-" + currentTab + " .is-checked").data("filter");
                // Reinit
                var container = (currentTab === "widget" ? $containerWidget : $containerModule);

                // Priority is action search, in the case text search is not empty 
                // will search and reset sub category is Show all
                if (filterValue !== "*") {
                    $(".for-" + currentTab + " .btn").removeClass("is-checked");
                    $(".for-" + currentTab + " li:first-child .btn").addClass("is-checked");
                }
                setTimeout(function () {
                    container.isotope({
                        // options
                        itemSelector: ".item",
                        layoutMode: "fitRows",
                        filter: function () {
                            if (search === "") {
                                // Check selected other category
                                if (filterValue === "*") {
                                    return true;
                                } else {
                                    return $(this).data("tag") === filterValue;
                                }
                            } else {
                                var label = $(this).find(".label").text().toLowerCase() + " "
                                        + $(this).find("small i").text().toLowerCase();
                                return label.search(search) !== -1;
                            }
                        }
                    });
                }, 100);
            });
            $("#modal_form").on("keyup", "#txt-search", function () {
                var search = $(this).val().toLowerCase();
                searchWidget(search);
            });

            $(".filters").on("click", "button", function () {
                var tab = $(this).closest("ol").data("for");
                var filterValue = filterValue = $(this).data("filter");
                var container = (tab === "widget" ? $containerWidget : $containerModule);
                $("#modal_form .for-" + tab + " button").removeClass("is-checked");
                $(this).addClass("is-checked");
                $("#txt-search").val("");
                $("#txt-search").focus();
                container.isotope({
                    filter: function () {
                        if (filterValue === "*") {
                            return true;
                        } else {
                            return $(this).data("tag").search(filterValue) >= 0;
                        }
                    }
                });
            });
            $(".filters li:first-child button").trigger("click");
        };
        this.hideSomeElement = function () {
            $('body', $('.fancybox-iframe').contents()).find("#header").hide();
            $('body', $('.fancybox-iframe').contents()).find("#footer").hide();
            $('body', $('.fancybox-iframe').contents()).find(".page-head, #nav-sidebar ").hide();
        };
        this.showOrHideCheckBox = function (checkbox) {
            id = $(checkbox).attr('id');
            if ($(checkbox).is(':checked'))
                $('.' + id).show();
            else
                $('.' + id).hide();
        };
        this.copyLang = function (element) {
            var $globalthis = this;
            var reg = new RegExp("_" + $globalthis.lang_id, "g");
            //if(typeof $(element) != undefined && !$(element).hasClass("ignore-lang") && typeof $(element).attr("id") != undefined) {
            if (typeof $(element) != undefined && !$(element).hasClass("ignore-lang") && $(element).attr("id")) {
                idTemp = $(element).attr("id").replace(reg, "");

                Object.keys($globalthis.languages).forEach(function (key) {
                    lang = $globalthis.languages[key];
                    if (lang != $globalthis.lang_id && $("#" + idTemp + "_" + lang).val() == "") {
                        $("#" + idTemp + "_" + lang).val($("#" + idTemp + "_" + $globalthis.lang_id).val());
                    }
                });
            }
        };
        this.initBlockLink = function (action) {
            $("#configuration_form .link_group").each(function(){
                if(!$(this).hasClass("addspan")){
                    $(this).addClass("addspan");
                    $(this).prepend('<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>');
                }
            });
            $("#configuration_form").sortable({
                items: ".link_group",
                update: function( event, ui ) {
                    count = 1;
                    
                    $("#configuration_form .link_group").each(function(){
                        $(this).data('index', count);
                        $(this).find('input[type="text"]').each(function () {
                            $globalthis.changeBlockLinkName($(this), count);
                        });
                        $(this).find('textarea').each(function () {
                            $globalthis.changeBlockLinkName($(this), count);
                        });
                        $(this).find('select').each(function () {
                            $globalthis.changeBlockLinkName($(this), count);
                        });
                        count++;
                    });

                    $('#list_id_link').val('');
                    $('.link_group').each(function(){
                        $('#list_id_link').val($('#list_id_link').val()+$(this).data('index')+',');
                    })

                }
            });
        };
        this.initCounter = function (action) {
            $("#configuration_form .link_group").each(function(){
                if(!$(this).hasClass("addspan")){
                    $(this).addClass("addspan");
                    $(this).prepend('<span class="ui-icon ui-icon-arrowthick-2-n-s"></span>');
                }
            });
            $("#configuration_form").sortable({
                items: ".link_group",
                update: function( event, ui ) {
                    count = 1;

                    $("#configuration_form .link_group").each(function(){
                        $(this).data('index', count);
                        $(this).find('input[type="text"]').each(function () {
                            $globalthis.changeBlockLinkName($(this), count);
                        });
                        $(this).find('textarea').each(function () {
                            $globalthis.changeBlockLinkName($(this), count);
                        });
                        $(this).find('select').each(function () {
                            $globalthis.changeBlockLinkName($(this), count);
                        });
                        count++;
                    });

                    $('#list_id_link').val('');
                    $('.link_group').each(function(){
                        $('#list_id_link').val($('#list_id_link').val()+$(this).data('index')+',');
                    })

                }
            });
        };
        this.changeBlockLinkName = function (element, count) {
             name = $(element).attr('name');

            if($(element).closest('.form-group').find('.translatable-field').length) {
                //link_title_3_1
                //_1
                naml = name.substr(name.lastIndexOf("_"));
                //link_title_3
                namer = name.substr(0, name.lastIndexOf("_"));
                nameNoN = namer.substr(0, namer.lastIndexOf("_"));

                $(element).attr('name', nameNoN+"_"+count+naml);
                $(element).attr('id', nameNoN+"_"+count+naml);

            }else{               
                nameNoN = name.substr(0, name.lastIndexOf("_"));
                $(element).attr('name', nameNoN+"_"+count);
                $(element).attr('id', nameNoN+"_"+count);
            }
            
        };
        this.saveWidget = function (type) {
            var $globalthis = this;
            currentE = $globalthis.currentElement;

            var ObjectForm = {form_id: "form_" + $globalthis.getRandomNumber()};
            contentHtml = "";

            widgetType = '';
            
            // FIX : widget AP_RAW_HTML always get content of AP_HTML which created before
            $($("#configuration_form").serializeArray()).each(function (i, field) {
                if (field.name.substring(0, 2).toLowerCase() == 'ap' && field.value == '1') {
                    widgetType = field.name;
                }
            });
            
            if (typeof tinyMCE != "undefined" && widgetType != 'ApRawHtml') {
                var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
                if (isChrome && (widgetType == 'ApHtml' || widgetType == 'ApImage' || widgetType == 'ApAlert')){
                    for (var i = 0; i < $('#configuration_form iframe').length; i++) {
                        var iframeDocument = document.getElementById($('#configuration_form iframe').eq(i).attr('id')).contentWindow.document;
                        var iframeContent = iframeDocument.getElementById('tinymce').innerHTML;
                        $("#" + $('#configuration_form iframe').eq(i).attr('id').replace(/_ifr/g, '')).val(iframeContent != '<p><br data-mce-bogus=\"1\"></p>' && iframeContent != '<p><br></p>' ? iframeContent : '');
                        // var mce = tinyMCE.editors[i].getContent();
                        // log(tinyMCE.activeEditor.settings.id);
                        //$("#" + tinyMCE.editors[i].settings.id).val(mce);
                    }
                }else{
                    tinyMCE.triggerSave();
                }
            }

            //update language for other field
            $("#configuration_form .lang-" + $globalthis.lang_id).each(function () {
                $(this).find('input[type="text"]').each(function () {
                    $globalthis.copyLang($(this));
                });
                $(this).find('textarea').each(function () {
                    $globalthis.copyLang($(this));
                });
            });

            $($("#configuration_form").serializeArray()).each(function (i, field) {
                
                // SET EMPTY VALUE AFTER UPDATE LANGUAGE FOR OTHER FIELD
                if( field.value == '_JS_EMPTY_VALUE_')
                {
                    field.value = '';
                }
                
                if (field.name.substring(0, 2).toLowerCase() == 'ap' && field.value == '1') {
                    widgetType = field.name;
                } else {
                    if (field.name == "content_html_" + $globalthis.lang_id) {
                        contentHtml = field.value.replace(/[\n]/g, "").replace(/[\r]/g, "");
                        if (type == "update") {
                            //$(currentE).find('.html-code').html(contentHtml);
                        }
                    }

                    var fName = field.name;
                    if (fName.indexOf('[]') != -1) {
                        fName = fName.replace('[]', '');
                        if (ObjectForm[fName]) {
                            ObjectForm[fName] += ',' + field.value;
                        }
                        else {
                            ObjectForm[fName] = field.value;
                        }
                    } else {
                        var valTemp = field.value.replace(/\&/g, '_APAMP_')
                                .replace(/\'/g, '_APAPOST_')
                                .replace(/\"/g, '_APQUOT_')
                                .replace(/[\t]/g, "_APTAB_")
                                .replace(/\[/g, "_APOBRACKET_")
                                .replace(/[\n]/g, "_APENTER_")
                                .replace(/[\r]/g, "")
                                .replace(/[+]/g, "_APPLUS_")
								.replace(/\{/g, "_APOCBRACKET_")
								.replace(/\}/g, "_APCCBRACKET_")
                                .replace(/\]/g, "_APCBRACKET_");
                        ObjectForm[fName] = valTemp;
                    }
                }
            });

            //for sub tab
            if (widgetType.indexOf('ApSub') == 0) {
                tmpObjectForm = {};
                tmpObjectForm.form_id = ObjectForm.form_id;
                tmpObjectForm.id = ObjectForm.id;
                Object.keys($globalthis.languages).forEach(function (key) {
                    tmpObjectForm["title_" + $globalthis.languages[key]] = ObjectForm["title_" + $globalthis.languages[key]];
                });
                ObjectForm = tmpObjectForm;
                oldHref = $(currentE).attr("href").toString().replace('#', '');
                panelFind = '.panel-collapse';
                if (widgetType == 'ApSubAccordion') {
                    ObjectForm.parent_id = $(currentE).data('form').parent_id;
                    panelFind = '.panel-collapse';
                } else {
                    panelFind = '.tab-pane';
                }
                $(currentE).html(ObjectForm['title_' + $globalthis.lang_id]);
                $(currentE).closest('.widget-row').find(panelFind).each(function () {
                    if ($(this).attr('id') == oldHref) {
                        $(this).attr('id', ObjectForm.id);
                        return false;
                    }
                });

                $(currentE).attr("href", "#" + ObjectForm.id);
            }
            if (type == "update") {
                // SAVE ACTIVE				
				//DONGND:: fix can't save tab after update
				if (widgetType != "ap_sub_tabs")
				{					
					if ($(currentE).find('.all-devicesd').hasClass("deactive")) {
						ObjectForm.active = 0;
					} else {
						ObjectForm.active = 1;
					}
				}

                if (widgetType == "ApColumn") {
                    $globalthis.changeColumnClass(currentE, ObjectForm);
                }
                if (widgetType == "ApRawHtml") {
                    $(currentE).data("form", ObjectForm);
                    $(currentE).find(".html-code").html(htmlentities(contentHtml));
                } else if (widgetType == "ApSubAccordion") {
                    ObjectForm["parent_id"] = $globalthis.parentId;
                    $(currentE).data("form", ObjectForm);
                } else {
                    $(currentE).data("form", ObjectForm);
                }
			
				//DONGND:: update name of tab after change
				if (widgetType == "ap_sub_tabs")
				{
					$(currentE).text(ObjectForm['title_' + $globalthis.lang_id]);
				}
				
				//console.log(ObjectForm);
                $(".label-tooltip").tooltip();
                return true;
            }
            dataInfo = $globalthis.shortcodeInfos[widgetType];

            if (widgetType == "ApTabs") {
                widget = $("#default_ApTabs").clone(1);
				//DONGND:: remove default tab and default content from tab clone
				$(widget).find('li#default_tabnav').remove();
				$(widget).find('div#default_tabcontent').remove();
                widget.removeAttr('id');
                $(".widget-container-heading a", $(widget)).each(function () {
                    if ($(this).parent().attr("id") != "default_tabnav" && !$(this).parent().hasClass("tab-button")) {
                        var ObjectTab = {form_id: "form_" + $globalthis.getRandomNumber()};
                        tabID = "tab_" + $globalthis.getRandomNumber();
                        ObjectTab.id = tabID;
                        ObjectTab["css_class"] = "";
                        ObjectTab["override_folder"] = "";
                        //set href for tab a
                        titleTab = $.trim($(this).html());
                        Object.keys($globalthis.languages).forEach(function (key) {
                            ObjectTab["title_" + $globalthis.languages[key]] = titleTab;
                        });

                        OldHref = $(this).attr('href').replace('#', '');
                        $(this).attr("href", "#" + tabID);
                        $(this).data("form", ObjectTab);

                        $(widget).find('.tab-pane').each(function () {
                            if ($(this).attr('id') == OldHref) {
                                $(this).attr('id', tabID);
                                return false;
                            }
                        });
                    }
                });
            } else if (widgetType == "ApAccordions") {
                widget = $("#default_ApAccordions").clone();
                widget.removeAttr('id');
                accIdWraper = "accordion_" + $globalthis.getRandomNumber();
                ObjectForm.id = accIdWraper;
                $('.panel-group', $(widget)).attr('id', accIdWraper);
                $(".panel-title a", $(widget)).each(function () {
                    $(this).data('parent', accIdWraper);
                    accIdSub = "collapse_" + $globalthis.getRandomNumber();
                    OldHref = $(this).attr('href').replace('#', '');
                    $(this).attr('href', "#" + accIdSub);
                    $('.panel-collapse', $(this).closest('.panel-default')).attr('id', accIdSub);
                    var ObjectTab = {form_id: "form_" + $globalthis.getRandomNumber()};
                    ObjectTab.parent_id = accIdWraper;
                    ObjectTab.id = accIdSub;
                    titleTab = $(this).html();
                    Object.keys($globalthis.languages).forEach(function (key) {
                        ObjectTab["title_" + $globalthis.languages[key]] = titleTab;
                    });
                    $(widget).find('.panel-collapse').each(function () {
                        if ($(this).attr('id') == OldHref) {
                            $(this).attr('id', tabID);
                            return false;
                        }
                    });

                    $(this).data("form", ObjectTab);
                });
                //$('.panel-collapse', $(widget)).last().collapse();
            } else {
                if ($("#default_" + widgetType).length)
                    widget = $("#default_" + widgetType).clone(1);
                else
                    widget = $("#default_widget").clone(1);
                if (widgetType == "ApRawHtml") {
                    $('.widget-title', $(widget)).remove();
                    if ($(widget).find('.html-code').first().length == 0) {
                        $(".widget-content", $(widget)).append("<pre><code class='html-code'>" + htmlentities(contentHtml) + "</code></pre>");
                    } else {
                        $(widget).find('.html-code').first().html(htmlentities(contentHtml));
                    }
                }
                widget.removeAttr('id');
            }

            //add new widget in column
            if (type == 'column') {
                widget.removeAttr('id');
                $(currentE).append(widget);
            } else {
                column = $("#default_column").clone(1);
                column.removeAttr('id');
                objColumn = {form_id: "form_" + $globalthis.getRandomNumber()};
                jQuery.extend(objColumn, $globalthis.getColDefault());
                $(column).data("form", objColumn);

                $('.column-content', $(column)).append(widget);

                group = $("#default_row").clone();
                group.removeAttr('id');
                //var html = $(group).find(".group-controll-right").html();
                //$(group).find(".group-controll-right").html(html);
                $(group).data("form", {form_id: "form_" + $globalthis.getRandomNumber(), 'class': 'row'});
                $('.group-content', $(group)).append(column);
                $(currentE).before(group);
            }

            //if element is widget
            if (widgetType) {
                $(widget).addClass('widget-icon');
                $('.widget-title', $(widget)).html(dataInfo.label);
                $('.widget-title', $(widget)).attr('title', dataInfo.desc);
                $('.w-icon', $(widget)).addClass(dataInfo.icon_class).addClass(widgetType);
            }
            //if element is module
            $(widget).data("form", ObjectForm);
            $(widget).data("type", widgetType);
            $(widget).find(".label-tooltip").tooltip();
            $globalthis.sortable();
        };
        this.returnColValue = function (colNumber, finalVal) {
            $globalthis = this;
            widthVal = $globalthis.returnWidthClass();

            startSet = 0;
            var colDefault = $globalthis.getColDefault();
            for (j = 0; j < $globalthis.arrayCol.length; j++) {
                if ($globalthis.arrayCol[j] == widthVal) {
                    startSet = 1;
                    colDefault[$globalthis.arrayCol[j]] = finalVal;
                    continue;
                }

                //default xs = 6-> 2 cols.but we set 2 cols, we have to assign again 
                if (startSet && ((12 / parseInt(colDefault[$globalthis.arrayCol[j]])) < colNumber)) {
                    colDefault[$globalthis.arrayCol[j]] = finalVal;
                }
            }
            return colDefault;
        };
        this.changeColumnClass = function (element, dataObj) {
            var $globalthis = this;
            columnClass = 'column-row ' + $globalthis.classWidget;
            Object.keys($globalthis.getColDefault()).forEach(function (key) {
                columnClass += ' col-' + key + '-' + dataObj[key].toString().replace('.', '-');
            });
            $(element).attr('class', columnClass);
        };
        this.getSubWidget = function (container) {
            var $globalthis = this;
            var widgetList = new Object();

            $(container).children().each(function (iWidget) {
                var objWidget = new Object();
                objWidget.params = $(this).data('form');
                if($.isEmptyObject( objWidget.params ) )
                {
					$(this).css('background-color', '#ff6f6f');
                    // Dont have param -> dont save
                    $globalthis.isValid = false;
                }else{
                    $(this).css("background-color", "");
                }
                objWidget.type = $(this).data('type');

                //if it is special widget - load sub widget
                if ($(this).find('.subwidget-content').length) {
                    objWidget.widgets = new Object();
                    iSubWidget = 0

                    $(this).find('.widget-container-heading a').each(function () {
                        if ($(this).parent().attr("id") != "default_tabnav" && !$(this).parent().hasClass("tab-button")) {

                            var objSubWidget = new Object();
                            objSubWidget.params = $(this).data('form');
                            element = $($(this).attr('href')).find('.subwidget-content').first();
                            objSubWidget.widgets = $globalthis.getSubWidget(element);

                            objWidget.widgets[iSubWidget] = objSubWidget;
                            iSubWidget++;
                        }
                    });
                }
                widgetList[iWidget] = objWidget;
            });
            return widgetList;
        };
        this.getHookSubmit = function (group, isEscape) {
            var $globalthis = this;
            //group object - contain column
            var objGroup = new Object();
            objGroup.params = $(group).data('form');
            objGroup.columns = new Object();
            //find column in this group
            $('.column-row', $(group)).each(function (iColumn) {
                var objColumn = new Object();
                objColumn.params = $(this).data('form');
                //pass widget for each column
                objColumn.widgets = $globalthis.getSubWidget($(this).find('.column-content').first());
                //pass column for each group
                objGroup.columns[iColumn] = objColumn;
            });

            //pass group for each hook
            return objGroup;
        };
        this.submitForm = function () {
            var $globalthis = this;
			//DONGND: check save submit
			if(typeof checkSaveSubmit != 'undefined' && checkSaveSubmit == 0)
			{
				// SUBMIT FORM - AJAX
				$("#page-header-desc-appagebuilder-save").removeAttr("onclick");
				$(document).on("click", "#page-header-desc-appagebuilder-save", function () {
					//filter all group
					$("#ap_loading").show();
					url = $globalthis.ajaxHomeUrl + '&ajax=1&action=saveData&id_profile=' + $('#current_profile').data('id');
					//form object
					var objects = new Object();
					var isValid = true;
					$('.hook-wrapper').each(function (iHook) {
						//hook object contain group
						var objHook = new Object();
						objHook.name = $(this).data("hook");

						// Get position id
						var select = $(this).closest(".position-cover").find(".dropdown ul");
						objHook.position = $(select).data("position");
						objHook.position_id = $(select).data("id");
						if (!objHook.position_id) {
							//alert($(select).data("blank-error"));
							isValid = false;
							//return false;
						}

						objHook.groups = {};
						$('.group-row', $(this)).each(function (iGroup) {
							objHook.groups[iGroup] = $globalthis.getHookSubmit(this, true);
						});
						//set hook to object
						objects[iHook] = objHook;
					});
					
					//DONGND: enable save multithreading
					if(checkSaveMultithreading == 1)
					{
						var i = 0;
						doLoop(isValid);							
					}
					else
					{
						data = 'dataForm=' + JSON.stringify(objects);
						$.ajax({
							type: "POST",
							headers: {"cache-control": "no-cache"},
							url: url,
							async: true,
							cache: false,
							data: data,
                                                        dataType: 'json',
                                                        cache: false,
							success: function (json) {
								//fix bug prestashop 1.7.6.2 can not get address_token
								if (typeof address_token === "undefined") {
									var match = RegExp('[?&]' + 'token' + '=([^&]*)').exec(window.location.search);
									address_token = match && decodeURIComponent(match[1].replace(/\+/g, ' '));                                                      
								}
								$("#ap_loading").hide();
								if (json && json.hasError == true){
									alert(json.errors);
								}else{
									if (!isValid) {
										window.location.reload(true);
									}
									else
									{
										showSuccessMessage('Update successful');
									}
								}
							},
							error: function (XMLHttpRequest, textStatus, errorThrown) {
								$("#ap_loading").hide();
								alert("TECHNICAL ERROR: \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);
							}
						});
					};
					
					//DONGND: function run save multithreading
					function doLoop(isValid) {		
						var temp_obj = new Object();
						temp_obj[i] = objects[i];
						data = 'dataForm=' + JSON.stringify(temp_obj);						
						if(i+1 == Object.keys(objects).length)
						{
							data += '&dataLast=1';
						};
						
						if(i==0)
						{
							data += '&dataFirst=1';
						};
						
						$.ajax({
							type: "POST",
							headers: {"cache-control": "no-cache"},
							url: url,
							async: true,
							cache: false,
							data: data,
							dataType: 'json',
							cache: false,
							success: function (json) {
								if (json && json.hasError == true){
									$("#ap_loading").hide();
									alert(json.errors);
								}else{
									i++;
									if(i< Object.keys(objects).length)
										doLoop(isValid);
									if(i == Object.keys(objects).length)
									{
										$("#ap_loading").hide();
										if (!isValid) {
											window.location.reload(true);
										}
										else
										{
											showSuccessMessage('Update successful');
										}
									}
								}
							},
							error: function (XMLHttpRequest, textStatus, errorThrown) {
								$("#ap_loading").hide();
								alert("TECHNICAL ERROR: \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);
							}
						});				
					};
					return false;
				});
			}
			else
			{
				// SUBMIT FORM - Normal
				$("#page-header-desc-appagebuilder-save").removeAttr("onclick");
				$(document).on("click", "#page-header-desc-appagebuilder-save", function () {
					var objects = new Object();
					$globalthis.isValid = true;
					$('.hook-wrapper').each(function (iHook) {
						//hook object contain group
						var objHook = new Object();
						objHook.name = $(this).data("hook");

						// Get position id
						var select = $(this).closest(".position-cover").find(".dropdown ul");
						objHook.position = $(select).data("position");
						objHook.position_id = $(select).data("id");
						// Tuan Vu : comment this code because In new bank profile doen't have position_id
						//if (!objHook.position_id) {
							//$globalthis.isValid = false;
						//}

						objHook.groups = {};
						$('.group-row', $(this)).each(function (iGroup) {
							objHook.groups[iGroup] = $globalthis.getHookSubmit(this, true);
						});
						//set hook to object
						objects[iHook] = objHook;
					});
					//console.log(objects);
					$('#data_profile').val(JSON.stringify(objects));
					$('#data_id_profile').val($('#current_profile').data('id'));
                                        
					if($globalthis.isValid == true)
					{
						$("#form_data_profile button").click();
					}else{
						alert('A widget has error, please reload this profile.');
					}
				});
			};
			
			//DONGND:: submit shortcode
			$(document).on("click", ".shortcode_save_btn, .shortcode_save_stay_btn", function () {			
				
				if ($(this).hasClass('shortcode_save_stay_btn'))
				{
					$('#stay_page').val(1);
				}
				else
				{
					$('#stay_page').val(0);
				}
				// console.log($globalthis);
				// $globalthis.isValid = true;
				var objHook = new Object();
				objHook.groups = {};
				// console.log($('.group-row'));
				$('.hook-wrapper .group-row').each(function (iGroup) {
					
					objHook.groups[iGroup] = $globalthis.getHookSubmit(this, true);
				});
				// console.log(objHook);
				$('#shortcode_content').val(JSON.stringify(objHook));
				
				$('#appagebuilder_shortcode_form').submit();
				return false;
			});
			
            $(document).on("click", ".position-cover .list-position .position-name", function () {
                var select = $(this).closest("ul");
                var isRunning = (typeof $(select).attr("isRunning") != "undefined") ? $(select).attr("isRunning") : "";
                if (isRunning.length > 0) {
                    return;
                }
                $(select).attr("isRunning", "running");

                var id = parseInt($(this).data("id"));
                var cover = $(select).closest(".position-cover");
                $("#ap_loading").show();
                $.ajax({
                    type: "POST",
                    headers: {"cache-control": "no-cache"},
                    url: $globalthis.ajaxHomeUrl,
                    async: true,
                    dataType: 'json',
                    cache: false,
                    data: {
                        "id": id,
                        "action": "selectPosition",
                        "position": $(select).data("position"),
                        "id_profile": $('#current_profile').data('id')
                    },
                    success: function (json) {
						//fix bug prestashop 1.7.6.2 can not get address_token
                        if (typeof address_token === "undefined") {
                            var match = RegExp('[?&]' + 'token' + '=([^&]*)').exec(window.location.search);
                            address_token = match && decodeURIComponent(match[1].replace(/\+/g, ' '));                                                      
                        }
                        $("#ap_loading").hide();
                        if (json && json.hasError == true){
                            alert(json.errors);
                        }else{
                            $(cover).html(json.html);
                            $globalthis.reInstallEvent(json.data);
                            btn_new_widget_group('.btn-new-widget-group');
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        $("#ap_loading").hide();
                        alert("TECHNICAL ERROR: \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);
                    },
                    complete: function () {
                        $(select).attr("isRunning", "");
                    }
                });
                return false;
            });

            $(document).on("click", ".box-edit-position .btn-save", function () {
                var btn = $(this);
                var mode = $(this).closest(".box-edit-position").data("mode");
                var position = $(this).closest(".box-edit-position").data("position");
                var name = $.trim($(this).closest(".box-edit-position").find(".edit-name").val());
                var id = $(this).closest(".box-edit-position").data("id");
                var cover = $(this).closest(".position-cover");
                $("#ap_loading").show();
                $.ajax({
                    type: "POST",
                    dataType: "Json",
                    headers: {"cache-control": "no-cache"},
                    url: $globalthis.ajaxHomeUrl,
                    async: true,
                    cache: false,
                    data: {
                        "id": id,
                        "name": name,
                        "mode": mode,
                        "action": "processPosition",
                        "position": position,
                        "id_profile": $('#current_profile').data('id')
                    },
                    success: function (json) {
                        $("#ap_loading").hide();
                        if (json && json.hasError == true){
                            alert(json.errors);
                        }else{
							//fix bug prestashop 1.7.6.2 can not get address_token
							if (typeof address_token === "undefined") {
								var match = RegExp('[?&]' + 'token' + '=([^&]*)').exec(window.location.search);
								address_token = match && decodeURIComponent(match[1].replace(/\+/g, ' '));                                                      
							}
                            if (mode == "new" || mode == "duplicate") {
                                $(cover).html(json.html);
                                $globalthis.reInstallEvent(json.data);
                            }
                            // Update name after changed
                            else {
                                $(cover).find(".dropdown .lbl-name").text(name);
                                $(btn).closest(".box-edit-position").addClass("hide");
                            }
                            btn_new_widget_group('.btn-new-widget-group');
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        $("#ap_loading").hide();
                        alert("TECHNICAL ERROR: \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);
                    },
                    complete: function () {
                        $("#ap_loading").hide();
                    }
                });
                //$(this).closest(".box-edit-position").addClass("hide");
            });

            $(document).on("click", ".position-cover .list-position .icon-edit, .add-new-position", function (e) {
                var boxEdit = $(this).closest(".dropdown").find(".box-edit-position");
                var input = $(boxEdit).find(".edit-name");
                $(boxEdit).removeClass("hide");
                $(boxEdit).attr("data-mode", $(this).hasClass("add-new-position") ? "new" : "edit");
                $(boxEdit).attr("data-position", $(this).closest("ul").data("position"));
                $(boxEdit).attr("data-id", $(this).data("id"));
                $(this).closest(".dropdown").removeClass("open");

                var span = $(this).closest("a").find("span");
                input.val(span.text());
                input.focus();
                e.stopPropagation();
                return false;
            });
            //icon-edit
            $(document).on("click", ".box-edit-position .btn-default", function () {
                $(this).closest(".box-edit-position").addClass("hide");
                //var id = "#dropdown-" + $(this).closest(".box-edit-position").data("position");
                //log(id);
                $("#dropdown-header").trigger("click");
            });

            $(document).on("click", ".position-cover .list-position .icon-paste", function (e) {
                var boxEdit = $(this).closest(".dropdown").find(".box-edit-position");
                var input = $(boxEdit).find(".edit-name");
                $(boxEdit).removeClass("hide");
                $(boxEdit).attr("data-mode", "duplicate");
                $(boxEdit).attr("data-position", $(this).closest("ul").data("position"));
                $(boxEdit).attr("data-id", $(this).data("id"));
                $(this).closest(".dropdown").removeClass("open");

                var span = $(this).closest("a").find("span");
                input.val($(this).data("temp") + " " + span.text());
                input.focus();
                e.stopPropagation();
                return false;

                var boxEdit = $(this).closest(".dropdown").find(".box-edit-position");
                var input = $(boxEdit).find(".edit-name");
                $(boxEdit).removeClass("hide");
                $(boxEdit).attr("mode", "duplicate");
                $(boxEdit).attr("id", $(this).data("id"));
                $(this).closest(".dropdown").removeClass("open");

                var span = $(this).closest("a").find("span");
                input.val(span.text());
                input.focus();
                e.stopPropagation();
                return false;
                return false;
            });
        };
        this.reInstallEvent = function (dataForm) {
            var $globalthis = this;
            $globalthis.initDataFrom(dataForm);
            $globalthis.setGroupAction();
            $globalthis.sortable();
            $(".label-tooltip").tooltip();
            //$globalthis.setButtonAction();
            //$globalthis.submitForm();
        }
        this.initColumnSetting = function () {
            var $globalthis = this;
            var classActive = $globalthis.returnWidthClass();
            $(".column-row").each(function () {
                $globalthis.getNumberColumnInClass(this, classActive);
            });
        }
        this.getNumberColumnInClass = function (obj, type) {
            var cls = $(obj).attr("class").split(" ");
            var len = cls.length;
            var result = "";
            for (var i = 0; i < len; i++) {
                if (cls[i].search("col-" + type) >= 0) {
                    result = cls[i];
                    break;
                }
            }
            var temp = result.replace("col-" + type + "-", "");
            $(obj).find(".pull-right .btn-group .btn span:first-child").attr("class", "width-val ap-w-" + temp);
            var group = $(obj).find("ul.dropdown-menu-right");
            $(group).find("li").removeClass("selected");
            $(group).find(".col-" + temp).addClass("selected");
        }
        //THIS IS VERY IMPORTANT TO KEEP AT THE END
        return this;
    };
})(jQuery);

/**
 * FIX : cant focus to textbox of popup TinyMCE
 * http://screencast.com/t/9r6kLtiTMR8S
 */
$(document).on('focusin', function (e) {
    if ($(e.target).closest(".mce-window").length) {
        e.stopImmediatePropagation();
    }
});

/**
 * Fixed case : ajax load html, doesnt have event popover
 */
function btn_new_widget_group() {
    $('.btn-new-widget-group').popover({
        html: true,
        content: function () {
            $globalthis.currentElement = $(this).closest('.hook-content-footer');
            //$globalthis.currentElement = $('.group-content',$(this).closest('.group-row'));
            return $('#addnew-widget-group-form').html();
        }
    });
}