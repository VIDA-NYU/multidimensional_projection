var SigSlots = (function() {
  ////// Signals definition is centralized here.
  __sig__.radviz_points_fetched = function(points) {};

  var pub = {};
  ////// CONNECTS SIGNALS TO SLOTS
  // e.g. SigSlots.connect(__sig__.eventHappened, myObject, myObject.onEventHappened);
  pub.connect = function(
      signal, slotInstance, slotMethod) {
    __sig__.connect(
      __sig__, signal,
      slotInstance, slotMethod);
  };
  return pub;
}(
));
