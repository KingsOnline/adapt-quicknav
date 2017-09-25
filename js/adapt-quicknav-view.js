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

    render: function() {
      var template = Handlebars.templates["quicknav-bar"];
      this.$el.html(template(this.model));
      if (this.model.config._stickyQuicknav._isEnabled) {
        $('html').removeClass('sticky-quicknav');
        this.scrollHandler();
        this.listenTo(Adapt, 'router:location', this.stopScrollListener);
      }
      return this;
    },

    scrollHandler: function() {
      var context = this;
      $(window).on('resize scroll', function() {
        context.checkIfBottom(context);
      });
    },

    stopScrollListener: function() {
      $(window).off('resize scroll');
    },

    checkIfBottom: _.throttle(function() {
      if (window.innerHeight + document.body.scrollTop >= document.body.offsetHeight) {
        $('html').addClass('sticky-quicknav');
        this.stopScrollListener();
      }
    }, 50),

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

  return QuickNavView;
});
