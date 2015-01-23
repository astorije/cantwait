// COLLECTION HELPERS
// ------------------

/**
 * Generic usage of Array.prototype.forEach that can also be used on NodeList elements.
 *
 * @param {(*[]|NodeList)} elements  The elements to be processed
 * @param {}               callback  Function to execute for each element
 */
function forEach(elements, callback) {
  [].forEach.call(elements, callback);
}

/**
 * Generic usage of Array.prototype.map that can also be used on NodeList elements.
 *
 * @param {(*[]|NodeList)} elements  The elements to be processed
 * @param {}               callback  Function to execute for each element
 * @return *[]                       The mapped array
 */
function map(elements, callback) {
  return [].map.call(elements, callback);
}

/**
 * Checks the presence of a value in an array
 *
 * @param   {*[]} array  The array to check
 * @returns {Boolean}    true if the value exists, false otherwise
 */
function contains(array, value) {
  return array.indexOf(value) !== -1;
}

// DOM HELPERS
// -----------

/**
 * Displays a non-visible HTML element (mutable function)
 *
 * @param {(HTMLElement|HTMLElement[]|NodeList)} elements  The HTML element(s) to show
 */
function show(elements) {
  if (typeof elements.length === "undefined") {
    elements.classList.remove("hidden");
  } else {
    forEach(elements, function (element) {
      show(element);
    });
  }
}

/**
 * Hides an HTML element (mutable function)
 *
 * @param {(HTMLElement|HTMLElement[]|NodeList)} elements  The HTML element(s) to hide
 */
function hide(elements) {
  if (typeof elements.length === "undefined") {
    elements.classList.add("hidden");
  } else {
    forEach(elements, function (element) {
      element.classList.add("hidden");
    });
  }
}

/**
 * Removes all children ofa given HTML element (mutable function)
 *
 * @param {HTMLElement} element  The element to empty
 */
function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Transforms a string-based HTML element into a native HTML element where DOM API applies
 *
 * @param   {String}  str  A string containing an HTML element
 * @returns {HTMLElement}      An HTML element
 */
function stringToElement(str) {
  var div = document.createElement('div');
  div.innerHTML = str;
  return div.firstElementChild;
}

/**
 * Build a HTML <ul> list for each string of an array
 *
 * @param   {String[]} array    The elements to be used
 * @returns {HTMLUListElement}  The built <ul> list
 */
function buildList(array) {
  return stringToElement("<ul>" + array.reduce(function (previousValue, currentValue) {
    return previousValue + "<li>" + currentValue + "</li>";
  }, "") + "</ul>");
}

// OTHER HELPERS
// -------------

/**
 * Decimal adjustment of a number.
 * Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round#Example:_Decimal_rounding
 *
 * @param   {(Number|String)} value    The number.
 * @param   {Number}          [exp=0]  The exponent (the 10 logarithm of the adjustment base).
 * @returns {Number}                   The adjusted value.
 */
function round(value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math.round(value);
  }

  value = +value;
  exp   = +exp;

  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }

  // Shift
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}

/**
 * Generate a random identifier, random enough to be considered as unique.
 *
 * @returns {String}  A random string (16 alphanumerical characters)
 */
function generateRandomString() {
  return Math.random().toString(36).substr(2, 8);
}

/**
 * Returns the current date
 *
 * @returns {Date}  The current date
 */
function now() {
  return new Date();
}

/**
 * Sets an interval while calling the function directly, instead of waiting for the end of the interval to call `func` for the first time.
 *
 * @param   {function} func   The function to be called repeatedly
 * @param   {Number}   delay  The number of milliseconds that the `setInterval()` function should wait before each call to func.
 * @returns {Number}          The unique interval ID created by `setInterval()`
 */
function setIntervalAndCall(func, delay) {
  func();
  return window.setInterval(func, delay);
}

// TEMPLATING SYSTEM
// -----------------

/**
 * Returns a template based on his Id
 * @param   {String} templateId  The name that will be used to fetch the template content from the HTML markup
 * @returns {String}             The unrendered template
 */
function getTemplate(templateId) {
  return templates[templateId];
}

/**
 * Renders a set of data inside a template
 *
 * @param   {String} template  The unrendered template
 * @param   {Object} data      The set of data to be used. Keys must exist with format {{key}} to be used in the template
 * @returns {String}           The template after rendering the data
 */
function render(template, data) {
  var key;
  for (key in data) {
    template = template.replace(new RegExp('{{' + key + '}}', 'g'), data[key]);
  }
  return template;
}

// CANTWAIT FUNCTIONS
// ------------------

/**
 * Transforms a number of seconds into a human-readable (if this human reads English) string.
 * It will show weeks, days, minutes and seconds in a way the the first unit will not be a zero
 *
 * @param   {Number} delta  The number of seconds to compute
 * @returns {String}        The human-readable string
 */
function prettyPrintDelta(delta) {
  var weeks   = Math.floor(delta / 604800),
      days    = Math.floor(delta / 86400) % 7,
      hours   = Math.floor(delta / 3600) % 24,
      minutes = Math.floor(delta / 60) % 60,
      seconds = delta % 60;

  var output = "";
  if (delta >= 604800) output += weeks   + " week"   + (weeks != 1 ? 's' : '')   + ', ';
  if (delta >= 86400)  output += days    + " day"    + (days != 1 ? 's' : '')    + ', ';
  if (delta >= 3600)   output += hours   + " hour"   + (hours != 1 ? 's' : '')   + ', ';
  if (delta >= 60)     output += minutes + " minute" + (minutes != 1 ? 's' : '') + ' and ';
                       output += seconds + " second" + (seconds != 1 ? 's' : '');
  return output;
}

/**
 * Returns an event input along with its label and "Delete event" button (if requested)
 *
 * @param   {String}  value         The input value
 * @param   {Number}  index         The label index
 * @param   {Boolean} showCloseBtn  Shows the "Delete event" button if true, hides it otherwise
 * @returns {HTMLElement}           The entire HTML element containing label, input and delete button
 */
function newEventInput(value, index, showCloseBtn) {
  var eventElement = stringToElement(render(getTemplate("input"), {
    id: generateRandomString(),
    eventNumber: index,
    value: value
  }));

  eventElement.querySelector(".close").addEventListener("click", function (evt) {
    evt.preventDefault();
    eventElement.remove();
    document.dispatchEvent(new Event("eventDeleted"));
  });

  if (!showCloseBtn)
    hide(eventElement.querySelector(".close"));

  return eventElement;
}

/**
 * Creates one event input for each date string given in the array argument.
 * If there is less than 2 strings given, 2 empty inputs are returned.
 *
 * @param   {String[]} strings  The dates to be parsed
 * @returns {HTMLElement[]}     An array of event inputs
 */
function createEventInputs(strings) {
  if (strings.length < 2) {
    return [newEventInput("", 1, false),
            newEventInput("", 2, false)];
  }
  else
    return map(strings, function (element, index) {
      return newEventInput(element, index + 1, strings.length > 2);
    });
}

/**
 * Set a progress bar element attributes depending on the given value (mutable function)
 *
 * @param {HTMLElement} progress  The progress bar container to modify
 * @param {Number}      ratio     The value to be applied to the progress bar
 */
function updateProgressBar(progress, ratio) {
  ratio = Math.min(Math.max(0.0, ratio), 1.0);

  var bar = progress.querySelector(".progress-bar"),
      value = progress.querySelector(".value"),
      percentage = round(100 * ratio, 2);

  value.textContent =  percentage + "%";
  bar.style.width = (100 * ratio) + "%";
  bar.setAttribute("aria-valuenow", percentage);

  if (ratio === 0 || ratio === 1.0) {
    progress.classList.remove("active");
    bar.classList.add("progress-bar-success");
  }
  else {
    progress.classList.add("active");
    bar.classList.remove("progress-bar-success");
  }
}

/**
 * Builds and returns strings indicating, for each event, the time spent or to be spent to reach a reference time
 *
 * @param   {Date[]} events     The list of events
 * @param   {Date}   time       The reference time to compare with each event
 * @returns {HTMLUListElement}  The list of computed timers
 */
function buildTimerList(events, time) {
  return buildList(map(events, function (event, index) {
    return render(getTemplate(time >= event ? "pastEvent" : "futureEvent"), {
      eventNumber: index + 1,
      time: prettyPrintDelta(round(Math.abs(time - event) / 1000))
    });
  }));
}

/**
 * Creates a collection of Date elements
 *
 * @param   {String[]} events  The strings to create the Date elements
 * @returns {Object}           The collection of Date elements
 */
function makeDateEvents(events) {
  return map(events, function (str) {
    return new Date(str);
  });
}

/**
 * Checks for input errors in a collection of dates
 * The errors checked are:
 * - The dates are invalid
 * - A given date happens before the previous element from the collection
 *
 * @param   {Date[]} dateEvents  The Date elements to check
 * @returns {Object}             The list of error indices and messages
 */
function checkForErrors(dateEvents) {
  var eventNumbers = [],
      messages = [];

  forEach(dateEvents, function (dateEvent, index) {
    var currentEventNumber = index + 1;

    // Validates the date format
    if (isNaN(dateEvent)) {
      eventNumbers.push(currentEventNumber);

      messages.push(render(getTemplate("invalidEvent"), {
        eventNumber: currentEventNumber
      }));
    }

    // Avoiding going outside of the array boundaries
    if (index === dateEvents.length - 1)
      return;

    // Validates the order on dates
    if (!isNaN(dateEvent) && !isNaN(dateEvents[index + 1]) && dateEvent >= dateEvents[index + 1]) {
      if (!contains(eventNumbers, currentEventNumber))
        eventNumbers.push(currentEventNumber);

      if (!contains(eventNumbers, currentEventNumber + 1))
        eventNumbers.push(currentEventNumber + 1);

      messages.push(render(getTemplate("predatedEvent"), {
        eventNumber1: currentEventNumber,
        eventNumber2: currentEventNumber + 1
      }));
    }
  });

  return {
    eventNumbers: eventNumbers,
    messages: messages
  };
}

/**
 * Creates a list of HTML elements, markers for each event, including their relative position
 *
 * @param   {Date[]} dateEvents  The Date elements, each of them will have a marker
 * @returns {HTMLElement}        The list of markers as HTML elements
 */
function makeEventMarkers(dateEvents) {
  return map(dateEvents, function (dateEvent, index) {
    return stringToElement(render(getTemplate("marker"), {
      eventNumber: index + 1,
      left:  100 * (dateEvent - dateEvents[0]) / (dateEvents[dateEvents.length - 1] - dateEvents[0]) + "%"
    }));
  });
}


/**
 * Updates the timers given a specific time and a list of events (mutable function)
 *
 * @param {HTMLElement} timersElement  The timer container to modify
 * @param {Number}      ratio          The value to be applied to the progress bar
 * @param {Element}     listElement    The list of timers to display
 */
function updateTimers(timersElement, ratio, listElement) {
  removeAllChildren(timersElement);

  timersElement.appendChild(listElement);

  timersElement.classList.remove("alert-warning");
  timersElement.classList.remove("alert-success");
  timersElement.classList.remove("alert-info");

  timersElement.classList.add(
    ratio <  0.0 ? "alert-warning" :
    ratio >= 1.0 ? "alert-success" :
                   "alert-info"
  );
}

/**
 * Updates the entire output given a specific time and a list of events (mutable function)
 *
 * @param {HTMLElement} outputElement  The timer container to modify
 * @param {Date}        time           The time used to compute the the timers
 * @param {Date[]}      dateEvents     The collection of events
 */
function updateOutput(outputElement, time, dateEvents) {
  var ratio = round(time - dateEvents[0], -3) / (dateEvents[dateEvents.length - 1] - dateEvents[0]);
  updateProgressBar(outputElement.querySelector(".progress"), ratio);
  updateTimers(outputElement.querySelector(".alert"), ratio, buildTimerList(dateEvents, time));
}

/**
 * Main function of cantwait (mutable function)
 * Computes and display all outputs for a set of given events
 * Does not take care of events, UI interaction, nor browser history manipulation
 *
 * @param   {String[]} events  The event strings to run cantwait from
 */
function cantwait(events) {
  var errorsElement  = document.querySelector("#errors"),
      markersElement = document.querySelector(".markers"),
      outputElement  = document.querySelector("#output"),
      inputsElement  = document.querySelector("#events"),
      dateEvents     = makeDateEvents(events),
      errors         = checkForErrors(dateEvents);

  removeAllChildren(markersElement);
  removeAllChildren(errorsElement);

  hide(errorsElement);
  hide(outputElement);

  forEach(inputsElement.querySelectorAll(".form-group"), function (inputElement) {
    inputElement.classList.remove("has-error");
  });

  if(errors.messages.length > 0) {
    forEach(errors.eventNumbers, function (number) {
      inputsElement.querySelector(".form-group:nth-child(" + number + ")").classList.add("has-error");
    });
    errorsElement.appendChild(buildList(errors.messages));
    show(errorsElement);
  }
  else if(dateEvents.length >= 2) {
    // Creates the circled markers above the progress bar
    forEach(makeEventMarkers(dateEvents), function (marker) {
      markersElement.appendChild(marker);
    });

    document.dispatchEvent(new CustomEvent("timerStarted", {
      detail: {
        newIntervalId: setIntervalAndCall(function () {
          updateOutput(document.querySelector("#output"), now(), dateEvents);
        }, 1000)
      }
    }));

    show(outputElement);
  }
}