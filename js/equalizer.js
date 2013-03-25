(function($) {

  var DEFAULT_LINKED_OPTION = false;

  var DEFAULT_EQUALIZER_TITLE = 'Equalizer';
  var DEFAULT_SHOW_SECTION_VALUE = 'true';
  var DEFAULT_SECTION_NAME = 'Section';
  var DEFAULT_SECTION_VALUE = 50;

  $.fn.equalizer = function(options) {
    options = options || {};
    var equalizerComp = $(this);
    if (!equalizerComp || !equalizerComp.is('div'))
      return console.error("Equalizer should not be applied on", equalizerComp);

    this.getFreeValue = getFreeValue;
    this.linked = options.linked || DEFAULT_LINKED_OPTION;
    this.freeValue = 100;
    this.equalizerComp = equalizerComp;
    this.title = options.title || DEFAULT_EQUALIZER_TITLE;
    this.showSectionValue = options.showSectionValue ||
      DEFAULT_SHOW_SECTION_VALUE
    this.sections = [];
    if (options.sections)
      for (var index = 0; index < options.sections.length; ++index)
        if (options.sections[index])
          this.sections[index] =
            new Section(this, index, options.sections[index]);
    build.call(this);
  }

  function build() {
    this.equalizerComp.addClass('equalizer');
    addTitle.call(this);
    addSections.call(this);
  }

  function addTitle() {
    var title = $('<span class="equalizer-title">' + this.title + '</span>');
    preventInteraction(title);
    title.appendTo(this.equalizerComp);
  }

  function addSections() {
    var sectionsWrapper = $('<div class="equalizer-sections-wrapper"/>');
    sectionsWrapper.appendTo(this.equalizerComp);
    for (var index = 0; index < this.sections.length; ++index)
      if (this.sections[index])
        this.sections[index].build().appendTo(sectionsWrapper);
  }

  function getFreeValue(offset) {
    if (this.linked === false || offset == 0) return offset;
    if (offset < 0) {
      this.freeValue = Math.min(this.freeValue - offset, 100);
      return offset;
    }
    if (this.freeValue == 0) return 0;
    var value = Math.min(offset, this.freeValue);
    this.freeValue = this.freeValue - value;
    return value;
  }

  // Section

  function Section(equalizer, index, section) {
    this.equalizer = equalizer;
    this.index = index;
    this.name = section.name || DEFAULT_SECTION_NAME + " " + index;
    var value = section.value || DEFAULT_SECTION_VALUE;
    this.value = Math.min(Math.max(equalizer.getFreeValue(value), 0), 100);
    this.showValue = equalizer.showSectionValue;
    this.changeListener = 'function'== typeof section.changeListener ?
      section.changeListener : undefined;
    this.build = buildSection;
    this.triggerChange = sectionTriggerChange;
  }

  function buildSection() {
    var section = this.sectionComp = $('<div class="equalizer-section"/>');
    preventInteraction(section);
    addSectionHeader.call(this);
    addSectionBar.call(this);
    addSectionFooter.call(this);
    return section;
  }

  function addSectionHeader() {
    var sectionHeader = this.sectionHeaderComp =
      $('<span class="equalizer-section-header"/>');
    preventInteraction(sectionHeader);
    sectionHeader.appendTo(this.sectionComp);
    if (this.showValue === true) sectionHeader.text(this.value);
  }

  function addSectionBar() {
    var bar = this.barComp = $('<div class="equalizer-section-bar"/>');
    preventInteraction(bar);
    bar.appendTo(this.sectionComp);
    var barValue = this.barValueComp = $('<div class="equalizer-section-bar-value"/>');
    barValue.css('height', this.value + '%');
    preventInteraction(barValue);
    barValue.appendTo(bar);
    addSectionBarButton.call(this);
  }

  function addSectionBarButton() {
    var button = this.barButtonComp =
      $('<div class="equalizer-section-bar-button default-cursor"/>');
    button.css('bottom', this.value + '%');
    button.appendTo(this.barComp);
    button.one('mousedown', { section: this }, dragStart);
  }

  function addSectionFooter() {
    var title = this.footerComp =
      $('<span class="equalizer-section-footer">' + this.name + '</span>');
    title.appendTo(this.sectionComp);
    preventInteraction(title);
  }

  function sectionTriggerChange(value) {
    if (this.showValue === true) this.sectionHeaderComp.text(value);
    if (this.changeListener) this.changeListener(this.name, value);
  }

  // Helpers

  function preventInteraction(element) {
    element.bind('mousedown drag dragstart dragend',
        function(event) { event.preventDefault(); });
  }

  function dragStart(event) {
    $('body').addClass('dragged');
    event.data.section.barButtonComp.removeClass('default-cursor');
    $('body').one('mouseup', event.data, dragEnd);
    $('body').bind('mousemove', event.data, drag);
  }

  function dragEnd(event) {
    $('body').unbind('mousemove', drag);
    event.data.section.barButtonComp.one('mousedown', event.data, dragStart);
    event.data.section.barButtonComp.addClass('default-cursor');
    $('body').removeClass('dragged');
  }

  function drag(event) {
    var buttonPos =
      parseFloat(event.data.section.barButtonComp.css('bottom')
          .replace(/[^0-9]+/, ""));
    var pageOffset = event.data.section.barButtonComp.offset().top - event.pageY;
    var buttonOffset = pageOffset <= -buttonPos ? -buttonPos :
      pageOffset >= 100 - buttonPos ? 100 - buttonPos : pageOffset;
    var offset = event.data.section.equalizer.getFreeValue(buttonOffset);
    var position = Math.max(0, Math.min(100, buttonPos + offset));
    event.data.section.barButtonComp.css('bottom', position + '%');
    event.data.section.barValueComp.css('height', position + '%');
    event.data.section.triggerChange(position);
  }

}) (jQuery);
