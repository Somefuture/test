function get_query_string(name) {
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var values = window.location.search.substr(1).match(reg);
    if(values!==null)return  unescape(values[2]);
    return null;
}


function getJsonFromUrl(url) {
    var qs = url.split("?")[1];
    var result = {};
    qs.split("&").forEach(function(part) {
        var item = part.split("=");
        result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
}


function scroll_load_more(list_id, underscore_template, load_data_id, options) {
    $.get_data = function () {
        var $load_data = $(load_data_id);
        if($load_data.length === 0){
            $(window).unbind('scroll', load_more);
            return;
        }
        var $list = $(list_id);
        var url = $load_data[0].getAttribute("href");
        var data = Object.assign({}, getJsonFromUrl(url), options);
        data.drop = parseInt(data.drop);
        data.take = parseInt(data.take);
        $.ajax({
            url: url,
            headers: {"X-Requested-With": "h5"},
            success: function (json) {
                if (json && json.error) {
                    swal("", json.error.message);
                } else {
                    data.success = json.success;
                    data.drop += 10;
                    $load_data.remove();
                    $list.append(underscore_template(data));
                }
            },
            error: function (xhr, status, message) {
                if (message === "Unauthorized" || message === "Gone") {
                    window.location.href = "login.html";
                } else {
                    swal("", "系统繁忙，请稍后再试。");
                }
            }
        });
    };
    var bottom_offset = 400;
    $.get_data();
    var load_more = _.debounce(function () {
        if (($(document).height() - $(window).scrollTop()) > bottom_offset) {
            $.get_data();
        }
    }, 500);
    $(window).scroll(load_more);
}
