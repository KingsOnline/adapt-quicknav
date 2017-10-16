/*
 * adapt-quicknav
 * License - http://github.com/adaptlearning/adapt_framework/LICENSE
 * Maintainers - Oliver Foster <oliver.foster@kineo.com>
 */

define([
  'core/js/adapt'
], function(Adapt) {

  var QuickNavView = Backbone.View.extend({

    className: "block quicknav",

    events: {
      "click #root": "onRootClicked",
      "click #previous": "onPreviousClicked",
      "click #up": "onUpClicked",
      "click #next": "onNextClicked"
    },

    initialize: function() {
      this.listenTo(Adapt, 'remove', this.remove);
      this.render();
      this.listenTo(Adapt, 'pageView:ready', this.startScrollListener);

      this.setLocking();

      if (this.model.config._isEnableNextOnCompletion) {
        var currentPageModel = this.model.state.currentPage.model;

        if (currentPageModel.get("_isComplete")) {
          this.onPageCompleted();
        } else {
          this.listenTo(currentPageModel, "change:_isComplete", this.onPageCompleted);
        }
      }
    },

    startScrollListener: function() {
      if (this.model.config._stickyQuicknav._isEnabled) {
        this.scrollHandler();
      }
    },

    render: function() {
      var template = Handlebars.templates["quicknav-bar"];
      this.$el.html(template(this.model));
      return this;
    },

    scrollHandler: function() {
      var context = this;
      $(window).on('scroll.quicknav', function() {
        context.checkIfBottom();
      });
    },

    stopScrollListener: function() {
      $(window).off('scroll.quicknav');
    },

    checkIfBottom: _.throttle(function() {
      var viewportTop = $(window).scrollTop();
      var viewportBottom = viewportTop + document.documentElement.clientHeight;
      var documentHeight = document.body.scrollHeight - 5;
      if (viewportBottom >= documentHeight) {
        Adapt.log.debug('BOTTOM');
        $('html').addClass('sticky-quicknav');
        this.stopScrollListener();
      }
    }, 20),

    setLocking: function() {
      this.model.state._locked = false;

      if (this.model.config._lock) {
        var contentObjects = this.model.config._lock;
        var completeCount = 0;

        for (var i = 0; i < contentObjects.length; i++) {
          var contentObject = Adapt.contentObjects.findWhere({
            _id: contentObjects[i]
          });

          if (contentObject.get("_isComplete") || !contentObject.get("_isAvailable")) completeCount++;
        }

        if (completeCount < contentObjects.length) {
          this.model.state._locked = true;
        }
      }

      if (this.model.state._locked === true) {
        this.$('#next').attr("disabled", "disabled");
      } else {
        this.$('#next').removeAttr("disabled");
      }
    },

    onRootClicked: function() {
      this.parent.onRootClicked();
    },

    onPreviousClicked: function() {
      this.parent.onPreviousClicked();
    },

    onUpClicked: function() {
      this.parent.onUpClicked();
    },

    onNextClicked: function() {
      this.parent.onNextClicked();
    },

    onPageCompleted: function() {
      this.setLocking();
    }

  });

  Adapt.on('router:page router:menu', function() {
    $('html').removeClass('sticky-quicknav');
    $(window).off('scroll.quicknav');
  });

  return QuickNavView;
});
