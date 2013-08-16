
// Graph object storage
var myGraph = {};

// Temporary gist data storage
var gistData = [];

// Select our active graphType choice
var selectGraphTypeButton = function() {
  var index = $($('.graph_type.btn-group button.graph_type.btn[value="' + myGraphType + '"]')).attr('name');
  $('.graph_type.btn-group button.graph_type.btn.active').removeClass('active');
  $($('.graph_type.btn-group button.graph_type.btn')[index]).addClass('active');
};

// Select our active lineMode choice
var selectLineModeButton = function() {
  var index = $($('.line_mode.btn-group button.line_mode.btn[value="' + myLineMode + '"]')).attr('name');
  $('.line_mode.btn-group button.line_mode.btn.active').removeClass('active');
  $($('.line_mode.btn-group button.line_mode.btn')[index]).addClass('active');
};

// Select our active areaMode choice
var selectAreaModeButton = function() {
  var index = $($('.area_mode.btn-group button.area_mode.btn[value="' + myAreaMode + '"]')).attr('name');
  $('.area_mode.btn-group button.area_mode.btn.active').removeClass('active');
  $($('.area_mode.btn-group button.area_mode.btn')[index]).addClass('active');
};

// Select our active pieMode choice
var selectPieModeButton = function() {
  var index = $($('.pie_mode.btn-group button.pie_mode.btn[value="' + myPieMode + '"]')).attr('name');
  $('.pie_mode.btn-group button.pie_mode.btn.active').removeClass('active');
  $($('.pie_mode.btn-group button.pie_mode.btn')[index]).addClass('active');
};

// Select our active logMode choice
var selectLogModeButton = function() {
  var index = $($('.log_mode.btn-group button.log_mode.btn[value="' + myLogMode + '"]')).attr('name');
  $('.log_mode.btn-group button.log_mode.btn.active').removeClass('active');
  $($('.log_mode.btn-group button.log_mode.btn')[index || 1]).addClass('active');
};

// Select our active drawNullAsZero choice
var selectNullModeButton = function() {
  var index = $($('.null_mode.btn-group button.null_mode.btn[value="' + myNullMode + '"]')).attr('name');
  $('.null_mode.btn-group button.null_mode.btn.active').removeClass('active');
  $($('.null_mode.btn-group button.null_mode.btn')[index]).addClass('active');
};

// Select our active hideLegend choice
var selectHideLegendButton = function() {
  var index = $($('.hide_legend.btn-group button.hide_legend.btn[value="' + myHideLegend + '"]')).attr('name');
  $('.hide_legend.btn-group button.hide_legend.btn.active').removeClass('active');
  $($('.hide_legend.btn-group button.hide_legend.btn')[index]).addClass('active');
};

// Select our active hideGrid choice
var selectHideGridButton = function() {
    var index = $($('.hide_grid.btn-group button.hide_grid.btn[value="' + myHideGrid + '"]')).attr('name');
    $('.hide_grid.btn-group button.hide_grid.btn.active').removeClass('active');
    $($('.hide_grid.btn-group button.hide_grid.btn')[index]).addClass('active');
};

// Select our active hideAxes choice
var selectHideAxesButton = function() {
    var index = $($('.hide_axes.btn-group button.hide_axes.btn[value="' + myHideAxes + '"]')).attr('name');
    $('.hide_axes.btn-group button.hide_axes.btn.active').removeClass('active');
    $($('.hide_axes.btn-group button.hide_axes.btn')[index]).addClass('active');
};

// Select our active hideYAxis choice
var selectHideYAxisButton = function() {
    var index = $($('.hide_yaxis.btn-group button.hide_yaxis.btn[value="' + myHideYAxis + '"]')).attr('name');
    $('.hide_yaxis.btn-group button.hide_yaxis.btn.active').removeClass('active');
    $($('.hide_yaxis.btn-group button.hide_yaxis.btn')[index]).addClass('active');
};

// Store our updated settings
var updateGraph = function(cb) {
  var myUrl = window.location.pathname;
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    data: {
      'overrides': {
        'titleLeft': myTitleLeft,
        'titleRight': myTitleRight,
        'ymaxLeft': myYMaxLeft,
        'ymaxRight': myYMaxRight,
        'graphType': myGraphType,
        'lineMode': myLineMode,
        'areaMode': myAreaMode,
        'pieMode': myPieMode,
        'logBase': myLogMode,
        'drawNullAsZero': myNullMode,
        'hideLegend': myHideLegend,
        'hideGrid': myHideGrid,
        'hideAxes': myHideAxes,
        'hideYAxis': myHideYAxis,
        'target': myGraph.target
      }
    },
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'PUT',
    url: myUrl
  }).done(function(d) {
    console.log('Graph ' + window.location.pathname.split('/').pop() + ' successfully updated');
    cb();
  });
};

// Render the composer preview image and JSON editor
var renderComposerModal = function() {

  // construct our image config
  var composerImage = $.extend({}, myGraph.mergedConfig(), {
    height: 150,
    width: $('#composer_modal img#preview').width(),
    options: '',
    targets: myGraph.targets()
  });

  var composerImageUrl = constructGraphUrl(composerImage);

  $.ajax({
    beforeSend: function(xhr) {
      var creds = graphiteUser + ':' + graphitePass;
      if (creds.length > 1) {
        var bytes = Crypto.charenc.Binary.stringToBytes(creds);
        var base64 = Crypto.util.bytesToBase64(bytes);
        xhr.setRequestHeader('Authorization', 'Basic ' + base64);
      }
    },
    //error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'HEAD',
    url: composerImageUrl
  }).success(function() {
    // populate composer image and textarea
    $('#composer_modal img#preview').attr('src', composerImageUrl + '&height=' + composerImage.height + '&width=' + composerImage.width);
    $('#composer_modal textarea').text(JSON.stringify(myGraph.mergedConfig().target, null, "  "));
  });
};

// Grab configuration blob and construct our graph urls
var renderGraphs = function() {
  var myUrl = window.location.pathname;
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: myUrl
  }).done(function(d) {
    if (typeof d === 'undefined') {
      console.log('No graphs found');
    }

    myGraph = new Graph(d);
    var profileConfig = $.extend({}, myGraph.mergedConfig(), {height: 300, options: ''});

    updateLocalSettings(myGraph.mergedConfig());

    $('div.graphs').append('<div class="row"></div>');
    $('div.graphs div.row').append('<div class="graph"></div>');
    $('div.graphs div.row div.graph').append('<div class="preview span12"></div>');
    $('div.graph div.preview').append('<img src="' + constructGraphUrl(profileConfig) + '" alt="' + d.name + '" name="' + d.uuid + '" />');
    $('div.graph div.preview img').load(function() {
      // hide spinner on successful load
      $(this).parent('div.preview').css('background-image', 'none')
    }).error(function() {
      console.log('failed to load ' + $(this)[0].name);
      var broken_img = $(this);
      // hide spinner and show placeholder img
      broken_img.css('display', 'none');
      broken_img.parent('div.preview').css('background-image', 'url("/img/descartes-logo.png")').css('background-color', '#eee')
    });

    renderComposerModal();
    selectActiveIntervalButton();
    renderMetaInfo(d);
    renderTitleLeft(myTitleLeft);
    renderTitleRight(myTitleRight);
    renderDescription(d.description);
    renderTags();
    renderYMaxLeft(myYMaxLeft);
    renderYMaxRight(myYMaxRight);
    selectGraphTypeButton();
    selectLineModeButton();
    selectAreaModeButton();
    selectPieModeButton();
    selectLogModeButton();
    selectNullModeButton();
    selectHideLegendButton();
    selectHideGridButton();
    selectHideAxesButton();
    selectHideYAxisButton();
    $.ajax({
      accepts: {json: 'application/json'},
      cache: false,
      dataType: 'json',
      error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
      url: constructGraphUrl($.extend(profileConfig, {format: 'json'}))
    }).done(function(d) {
      gistData = d;
    });
  });
};

// Populate our info box
var renderMetaInfo = function(info) {
  $('span#owner').text(info.owner);
  $('span#created_at').text(info.created_at);
}

// Populate our titleLeft box
var renderTitleLeft = function(titleLeft) {
  if ((typeof titleLeft === 'string') && (titleLeft.length > 0)) {
    myTitleLeft = titleLeft;
    $('span#titleLeft').text(titleLeft);
  } else {
    $('span#titleLeft').html('<span id="changeme">Click here to add a title for the left Y-Axis.</span>');
  }
};

// Populate our titleRight box
var renderTitleRight = function(titleRight) {
  if ((typeof titleRight === 'string') && (titleRight.length > 0)) {
    myTitleRight = titleRight;
    $('span#titleRight').text(titleRight);
  } else {
    $('span#titleRight').html('<span id="changeme">Click here to add a title for the right Y-Axis.</span>');
  }
};

// Populate our ymaxLeft box
var renderYMaxLeft = function(ymaxLeft) {
    if ((typeof ymaxLeft === 'string') && (ymaxLeft.length > 0)) {
        myYMaxLeft = ymaxLeft;
        $('span#ymaxLeft').text(ymaxLeft);
    } else {
        $('span#ymaxLeft').html('<span id="changeme">Click here to set a maximum for the left Y-Axis.</span>');
    }
};

// Populate our ymaxRight box
var renderYMaxRight = function(ymaxRight) {
    if ((typeof ymaxRight === 'string') && (ymaxRight.length > 0)) {
        myYMaxRight = ymaxRight;
        $('span#ymaxRight').text(ymaxRight);
    } else {
        $('span#ymaxRight').html('<span id="changeme">Click here to set a maximum for the right Y-Axis.</span>');
    }
};

// Populate our description box
var renderDescription = function(description) {
  if ((typeof description === 'string') && (description.length > 0)) {
    myDescription = description;
    $('span#description').text(description);
  } else {
    $('span#description').html('<span id="changeme">Click here to add your own description of this graph.</span>');
  }
};

// Reset titleLeft form
var resetTitleLeftForm = function(titleLeft) {
  $('div.titleLeft-wrapper span#titleLeft').removeClass('open').addClass('closed');
  $('div.titleLeft-wrapper span#titleLeft').children('input').remove();
  if ((typeof titleLeft === 'string') && (titleLeft.length > 0)) {
    $('div.titleLeft-wrapper span#titleLeft').text(titleLeft);
  } else if (myTitleLeft.length > 0) {
    $('div.titleLeft-wrapper span#titleLeft').text(myTitleLeft);
  } else {
    $('div.titleLeft-wrapper span#titleLeft').append('<span id="changeme">Click here to add a title for the left Y-Axis.</span>');
  }
  $('div.titleLeft-wrapper a').remove();
  return false;
};

// Reset titleRight form
var resetTitleRightForm = function(titleRight) {
  $('div.titleRight-wrapper span#titleRight').removeClass('open').addClass('closed');
  $('div.titleRight-wrapper span#titleRight').children('input').remove();
  if ((typeof titleRight === 'string') && (titleRight.length > 0)) {
    $('div.titleRight-wrapper span#titleRight').text(titleRight);
  } else if (myTitleRight.length > 0) {
    $('div.titleRight-wrapper span#titleRight').text(myTitleRight);
  } else {
    $('div.titleRight-wrapper span#titleRight').append('<span id="changeme">Click here to add a title for the right Y-Axis.</span>');
  }
  $('div.titleRight-wrapper a').remove();
  return false;
};

// Reset ymaxLeft form
var resetYMaxLeftForm = function(ymaxLeft) {
    $('div.ymaxLeft-wrapper span#ymaxLeft').removeClass('open').addClass('closed');
    $('div.ymaxLeft-wrapper span#ymaxLeft').children('input').remove();
    if ((typeof ymaxLeft === 'string') && (ymaxLeft.length > 0)) {
        $('div.ymaxLeft-wrapper span#ymaxLeft').text(ymaxLeft);
    } else if (myYMaxLeft.length > 0) {
        $('div.ymaxLeft-wrapper span#ymaxLeft').text(myYMaxLeft);
    } else {
        $('div.ymaxLeft-wrapper span#ymaxLeft').append('<span id="changeme">Click here to add a title for the left Y-Axis.</span>');
    }
    $('div.ymaxLeft-wrapper a').remove();
    return false;
};

// Reset ymaxRight form
var resetYMaxRightForm = function(ymaxRight) {
    $('div.ymaxRight-wrapper span#ymaxRight').removeClass('open').addClass('closed');
    $('div.ymaxRight-wrapper span#ymaxRight').children('input').remove();
    if ((typeof ymaxRight === 'string') && (ymaxRight.length > 0)) {
        $('div.ymaxRight-wrapper span#ymaxRight').text(ymaxRight);
    } else if (myYMaxRight.length > 0) {
        $('div.ymaxRight-wrapper span#ymaxRight').text(myYMaxRight);
    } else {
        $('div.ymaxRight-wrapper span#ymaxRight').append('<span id="changeme">Click here to add a title for the right Y-Axis.</span>');
    }
    $('div.ymaxRight-wrapper a').remove();
    return false;
};

// Reset description form
var resetDescriptionForm = function(desc) {
  $('div.description-wrapper span#description').removeClass('open').addClass('closed');
  $('div.description-wrapper span#description').children('textarea').remove();
  if ((typeof desc === 'string') && (desc.length > 0)) {
    $('div.description-wrapper span#description').text(desc);
  } else if (myDescription.length > 0) {
    $('div.description-wrapper span#description').text(myDescription);
  } else {
    $('div.description-wrapper span#description').append('<span id="changeme">Click here to add your own description of this graph.</span>');
  }
  $('div.description-wrapper a').remove();
  return false;
};

// Populate our tags box
var renderTags = function() {
  gatherTags(function(tags) { 
    $('div.tags-wrapper div.tags ul').remove();
    $('div.tags-wrapper div.tags span').remove();
    $('div.tags-wrapper div.tags').append('<ul></ul>');
    if ((typeof tags === 'object') && (tags.length > 0)) {
      for (var i in tags) {
        $('div.tags-wrapper div.tags ul').append('<li class="tag" id="' + tags[i].id + '"><a class="tag_delete" href="#"><i class="icon-minus-sign"></i></a> ' + tags[i].name + '</li>');
      }
    }
    $('div.tags-wrapper div.tags ul').append('<li class="tag"><a class="tag_add" href="#"><i class="icon-plus-sign"></i></a> <span class="tag_add">Add a new tag...</span></li>');
  });
};

// Delete a tag
var deleteTag = function(id, cb) {
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'DELETE',
    url: window.location.pathname + '/tags/' + id
  }).done(function(d) {
    console.log('Tag ' + id + ' successfully deleted');
    cb();
  });
};

// Add a tag
var addTag = function(name, cb) {
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    data: {'name': name},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'POST',
    url: window.location.pathname + '/tags'
  }).done(function(d) {
    console.log('Tag ' + name + ' successfully added');
    cb();
  });
};

// Gather tags
var gatherTags = function(cb) {
  return $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    url: window.location.pathname + '/tags'
  }).done(function(d) {
    cb(d);
  });
};

// Invert details button mode when activated
$(window).on('click', 'a.details.btn', function() {
  if ($('fieldset.in.collapse').length > 0) {
    resetFieldsetFormAndButtons($(this).attr('data-target'));
    $(this).text('Close Details').addClass('btn-inverse');
  } else {
    $(this).text('Details').removeClass('btn-inverse');
  }
});

// Convert titleLeft span into editable text
$('div.titleLeft-wrapper').on('click', 'span.closed#titleLeft', function() {
  $(this).unbind('click').removeClass('closed').addClass('open');
  $(this).html('<input type="text" class="titleLeft span4" value="' + myTitleLeft + '"></input>');
  $(this).after('<a class="titleLeft_submit btn btn-primary" href="#">Update Left Title</a>');
  $(this).after('<a class="titleLeft_cancel btn btn-inverse" href="#">Cancel</a>');
  $(this).children('input').focus().select();
  return false;
});

// Convert titleRight span into editable text
$('div.titleRight-wrapper').on('click', 'span.closed#titleRight', function() {
  $(this).unbind('click').removeClass('closed').addClass('open');
  $(this).html('<input type="text" class="titleRight span4" value="' + myTitleRight + '"></input>');
  $(this).after('<a class="titleRight_submit btn btn-primary" href="#">Update Right Title</a>');
  $(this).after('<a class="titleRight_cancel btn btn-inverse" href="#">Cancel</a>');
  $(this).children('input').focus().select();
  return false;
});

// Convert ymaxLeft span into editable text
$('div.ymaxLeft-wrapper').on('click', 'span.closed#ymaxLeft', function() {
    $(this).unbind('click').removeClass('closed').addClass('open');
    $(this).html('<input type="text" class="ymaxLeft span4" value="' + myYMaxLeft + '"></input>');
    $(this).after('<a class="ymaxLeft_submit btn btn-primary" href="#">Update Left Y-Axis Max</a>');
    $(this).after('<a class="ymaxLeft_cancel btn btn-inverse" href="#">Cancel</a>');
    $(this).children('input').focus().select();
    return false;
});

// Convert ymaxRight span into editable text
$('div.ymaxRight-wrapper').on('click', 'span.closed#ymaxRight', function() {
    $(this).unbind('click').removeClass('closed').addClass('open');
    $(this).html('<input type="text" class="ymaxRight span4" value="' + myYMaxRight + '"></input>');
    $(this).after('<a class="ymaxRight_submit btn btn-primary" href="#">Update Right Y-Axis Max</a>');
    $(this).after('<a class="ymaxRight_cancel btn btn-inverse" href="#">Cancel</a>');
    $(this).children('input').focus().select();
    return false;
});

// Convert description span into editable textarea
$('div.description-wrapper').on('click', 'span.closed#description', function() {
  $(this).unbind('click').removeClass('closed').addClass('open');
  $(this).html('<textarea class="description span4" rows="5">' + myDescription + '</textarea>');
  $(this).after('<a class="description_submit btn btn-primary" href="#">Update Description</a>');
  $(this).after('<a class="description_cancel btn btn-inverse" href="#">Cancel</a>');
  $(this).children('textarea').focus().select();
  return false;
});

// Reset titleLeft element on cancel
$('div.titleLeft-wrapper').on('click', 'a.titleLeft_cancel', resetTitleLeftForm);

// Reset titleRight element on cancel
$('div.titleRight-wrapper').on('click', 'a.titleRight_cancel', resetTitleRightForm);

// Reset ymaxLeft element on cancel
$('div.ymaxLeft-wrapper').on('click', 'a.ymaxLeft_cancel', resetYMaxLeftForm);

// Reset ymaxRight element on cancel
$('div.ymaxRight-wrapper').on('click', 'a.ymaxRight_cancel', resetYMaxRightForm);

// Reset description element on cancel
$('div.description-wrapper').on('click', 'a.description_cancel', resetDescriptionForm);

// Update titleLeft on submit
$('div.titleLeft-wrapper').on('click', 'a.titleLeft_submit', function() {
  var newTitleLeft = $(this).parent().children('span#titleLeft').children('input').val();
  myTitleLeft = newTitleLeft;
  resetTitleLeftForm(newTitleLeft);
  updateGraph(function() {
    clearGraphs();
    renderGraphs();
  });
  return false;
});

// Update titleRight on submit
$('div.titleRight-wrapper').on('click', 'a.titleRight_submit', function() {
  var newTitleRight = $(this).parent().children('span#titleRight').children('input').val();
  myTitleRight = newTitleRight;
  resetTitleRightForm(newTitleRight);
  updateGraph(function() {
    clearGraphs();
    renderGraphs();
  });
  return false;
});

// Update ymaxLeft on submit
$('div.ymaxLeft-wrapper').on('click', 'a.ymaxLeft_submit', function() {
    var newYMaxLeft = $(this).parent().children('span#ymaxLeft').children('input').val();
    myYMaxLeft = newYMaxLeft;
    resetYMaxLeftForm(newYMaxLeft);
    updateGraph(function() {
        clearGraphs();
        renderGraphs();
    });
    return false;
});

// Update ymaxRight on submit
$('div.ymaxRight-wrapper').on('click', 'a.ymaxRight_submit', function() {
    var newYMaxRight = $(this).parent().children('span#ymaxRight').children('input').val();
    myYMacRight = newYMaxRight;
    resetYMaxRightForm(newYMaxRight);
    updateGraph(function() {
        clearGraphs();
        renderGraphs();
    });
    return false;
});

// Update description on submit
$('div.description-wrapper').on('click', 'a.description_submit', function() {
  var newDescription = $(this).parent().children('span#description').children('textarea').val();
  myDescription = newDescription;
  updateObjectAttributes({ 'description': newDescription }, function() {
    resetDescriptionForm(newDescription);
  });
  return false;
});

// Submit object titleLeft change on enter
$('div.titleLeft-wrapper').on('keypress', 'input.titleLeft', function(e) {
  if (e.which === 13) {
    myTitleLeft = $('input.titleLeft').val();
    resetTitleLeftForm(myTitleLeft);
    updateGraph(function() {
      clearGraphs();
      renderGraphs();
    });
    return false;
  }
});

// Submit object titleRight change on enter
$('div.titleRight-wrapper').on('keypress', 'input.titleRight', function(e) {
  if (e.which === 13) {
    myTitleRight = $('input.titleRight').val();
    resetTitleRightForm(myTitleRight);
    updateGraph(function() {
      clearGraphs();
      renderGraphs();
    });
    return false;
  }
});

// Submit object ymaxLeft change on enter
$('div.ymaxLeft-wrapper').on('keypress', 'input.ymaxLeft', function(e) {
    if (e.which === 13) {
        myYMaxLeft = $('input.ymaxLeft').val();
        resetYMaxLeftForm(myYMaxLeft);
        updateGraph(function() {
            clearGraphs();
            renderGraphs();
        });
        return false;
    }
});

// Submit object ymaxRight change on enter
$('div.ymaxRight-wrapper').on('keypress', 'input.ymaxRight', function(e) {
    if (e.which === 13) {
        myYMaxRight = $('input.ymaxRight').val();
        resetYMaxRightForm(myYMaxRight);
        updateGraph(function() {
            clearGraphs();
            renderGraphs();
        });
        return false;
    }
});

// Submit object description change on enter
$('div.description-wrapper').on('keypress', 'input.description', function(e) {
  if (e.which === 13) {
    myDescription = $('input.description').val();
    updateObjectAttributes({ 'description': newDescription }, function() {
      resetDescriptionForm(myDescription);
    });
    return false;
  }
});

// Delete tag from list
$('div.tags-wrapper').on('click', 'a.tag_delete i', function() {
  var myTagId = $(this).parent().parent('li').attr('id');
  deleteTag(myTagId, function() {
    renderTags();
  });
  return false;
});

// Convert tag span into editable field
$('div.tags-wrapper').on('click', 'a.tag_add i', function() {
  $(this).parent('a').parent('li').children('span.tag_add').html('<input class="input-medium" type="text" name="new_tag"></input>');
  $(this).addClass('open');
  $('input[name="new_tag"]').focus();
});

// Add new tag
$('div.tags-wrapper div.tags').on('keypress', 'span.tag_add input[name="new_tag"]', function(e) {
  if (e.which === 13) {
    var myNewTag = $(this).val();
    addTag(myNewTag, function() {
      renderTags();
    });
    return false;
  }
});

// Reset tag input field on focusout
// XXX Potential race condition in that we call GET twice...
// XXX first after adding a tag (above), then here on focusout.
// XXX Not really a race condition per se, but a wasted call nonetheless.
$('div.tags-wrapper div.tags').on('focusout', 'span.tag_add input[name="new_tag"]', function() {
  renderTags();
});

// Update graphType on selection
$('.graph_type.btn-group button.graph_type.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    myGraphType = $(this).attr('value');
    updateGraph(function() {
      clearGraphs();
      renderGraphs();
    });
  }
});

// Update lineMode on selection
$('.line_mode.btn-group button.line_mode.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    myLineMode = $(this).attr('value');
    updateGraph(function() {
      clearGraphs();
      renderGraphs();
    });
  }
});

// Update areaMode on selection
$('.area_mode.btn-group button.area_mode.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    myAreaMode = $(this).attr('value');
    updateGraph(function() {
      clearGraphs();
      renderGraphs();
    });
  }
});

// Update pieMode on selection
$('.pie_mode.btn-group button.pie_mode.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    myPieMode = $(this).attr('value');
    updateGraph(function() {
      clearGraphs();
      renderGraphs();
    });
  }
});

// Update logMode on selection
$('.log_mode.btn-group button.log_mode.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    myLogMode = $(this).attr('value');
    updateGraph(function() {
      clearGraphs();
      renderGraphs();
    });
  }
});

// Update drawNullAsZero on selection
$('.null_mode.btn-group button.null_mode.btn').click(function() {
  if ($(this).attr('value').length > 0) {
    myNullMode = $(this).attr('value');
    updateGraph(function() {
      clearGraphs();
      renderGraphs();
    });
  }
});

// Update hideLegend on selection
$('.hide_legend.btn-group button.hide_legend.btn').click(function() {
    if ($(this).attr('value').length > 0) {
        myHideLegend = $(this).attr('value');
        updateGraph(function() {
            clearGraphs();
            renderGraphs();
        });
    }
});

// Update hideGrid on selection
$('.hide_grid.btn-group button.hide_grid.btn').click(function() {
    if ($(this).attr('value').length > 0) {
        myHideGrid = $(this).attr('value');
        updateGraph(function() {
            clearGraphs();
            renderGraphs();
        });
    }
});

// Update hideAxes on selection
$('.hide_axes.btn-group button.hide_axes.btn').click(function() {
    if ($(this).attr('value').length > 0) {
        myHideAxes = $(this).attr('value');
        updateGraph(function() {
            clearGraphs();
            renderGraphs();
        });
    }
});

// Update hideYAxis on selection
$('.hide_yaxis.btn-group button.hide_yaxis.btn').click(function() {
    if ($(this).attr('value').length > 0) {
        myHideYAxis = $(this).attr('value');
        updateGraph(function() {
            clearGraphs();
            renderGraphs();
        });
    }
});

// POST a new gist from profile
$('.tools.btn-group button.tools.btn.gist').click(function() {
  var graphUrl = $('.graph .preview img').attr('src');
  $.ajax({
    accepts: {json: 'application/json'},
    cache: false,
    data: {'url': graphUrl, 'data': JSON.stringify(gistData)},
    dataType: 'json',
    error: function(xhr, textStatus, errorThrown) { console.log(errorThrown); },
    type: 'POST',
    url: window.location.pathname + '/gists'
  }).done(function(d) {
    $('div.header').before(
      '<div class="alert alert-success">' +
      '<button type="button" class="close" data-dismiss="alert">×</button>' +
      'Snapshot successfully created by <strong>' + d.owner + '</strong> on ' + d.created_at + '.'
    );
  }).fail(function(d, textStatus, errorThrown) {
    $('div.header').before(
      '<div class="alert alert-danger">' +
      '<button type="button" class="close" data-dismiss="alert">×</button>' +
      'Unable to create snapshot: ' + errorThrown
    );
  });
  return false;
});

// Delete a graph
$('#destroy_modal .modal-footer button.delete').on('click', function() {
  deleteGraph($('div.graph div.preview img')[0].name, function() {
    console.log('deleted graph ' + $('div.graph div.preview img')[0].name);
    window.location.href = '/graphs';
  });
  return false;
});

// Bind composer textarea to edit and jsonlint
$('#composer_modal').on('input propertychange', 'textarea', function() {
  try {
    jsonlint.parse($(this).val());
    console.log('parses ok');
    myGraph.updateTargets(JSON.parse($(this).val()));
    renderComposerModal();
    $('#composer_modal button.targets_submit').removeClass('disabled');
  } catch(e) {
    console.log('parse failed');
    $('#composer_modal button.targets_submit').addClass('disabled');
  }
});

// Hidden key combo for composer modal
jwerty.key('alt+cmd+enter/alt+ctrl+enter', function() {
  $('#composer_modal').modal('toggle');
  $('textarea#targets_editor').focus();
});

// Activate composer modal
$('.tools.btn-group button.tools.btn.edit').on('click', function() {
  $('#composer_modal').modal('toggle');
});

// Edit graph targets
$('#composer_modal').on('click', 'button.targets_submit', function() {
  if ($(this).hasClass('disabled')) {
    console.log('broken JSON, unable to save changes');
  } else {
    updateGraph(function() {
      $('#composer_modal').modal('toggle');
      renderComposerModal();
      clearGraphs();
      renderGraphs();
    });
  }
});

// Not used in graph profile
var scrollNextPage = function() {
  return true;
}
