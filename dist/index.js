"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Detector = exports.Offline = exports.Online = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// these browsers don't fully support navigator.onLine, so we need to use a polling backup
var unsupportedUserAgentsPattern = /Windows.*Chrome|Windows.*Firefox|Linux.*Chrome/;

var config = {
  poll: unsupportedUserAgentsPattern.test(navigator.userAgent),
  url: "https://ipv4.icanhazip.com/",
  timeout: 5000,
  interval: 5000
};

var ping = function ping(config) {
  return new Promise(function (resolve, reject) {
    var isOnline = function isOnline() {
      return resolve(true);
    };
    var isOffline = function isOffline() {
      return resolve(false);
    };

    var xhr = new XMLHttpRequest();

    xhr.onerror = isOffline;
    xhr.ontimeout = isOffline;
    xhr.onload = function () {
      var response = xhr.responseText.trim();
      if (!response) {
        isOffline();
      } else {
        isOnline();
      }
    };

    xhr.open("GET", config.url);
    xhr.timeout = config.url;
    xhr.send();
  });
};

// base class that detects offline/online changes

var Base = function (_Component) {
  _inherits(Base, _Component);

  function Base() {
    _classCallCheck(this, Base);

    var _this = _possibleConstructorReturn(this, (Base.__proto__ || Object.getPrototypeOf(Base)).call(this));

    _this.state = {
      online: typeof navigator.onLine === "boolean" ? navigator.onLine : true
    };
    // bind event handlers
    _this.goOnline = _this.goOnline.bind(_this);
    _this.goOffline = _this.goOffline.bind(_this);
    return _this;
  }

  _createClass(Base, [{
    key: "renderChildren",
    value: function renderChildren() {
      var children = this.props.children;
      var _props$wrapperType = this.props.wrapperType,
          wrapperType = _props$wrapperType === undefined ? "span" : _props$wrapperType;

      // usual case: one child that is a react Element

      if (_react2.default.isValidElement(children)) {
        return children;
      }

      // no children
      if (!children) {
        return null;
      }

      // string children, multiple children, or something else
      var childrenArray = _react.Children.toArray(children);
      var firstChild = childrenArray[0];

      return _react.createElement.apply(undefined, [wrapperType, {}].concat(_toConsumableArray(childrenArray)));
    }
  }, {
    key: "goOnline",
    value: function goOnline() {
      if (!this.state.online) {
        this.callOnChangeHandler(true);
        this.setState({ online: true });
      }
    }
  }, {
    key: "goOffline",
    value: function goOffline() {
      if (this.state.online) {
        this.callOnChangeHandler(false);
        this.setState({ online: false });
      }
    }
  }, {
    key: "callOnChangeHandler",
    value: function callOnChangeHandler(online) {
      if (this.props.onChange) {
        this.props.onChange(online);
      }
    }
  }, {
    key: "startPolling",
    value: function startPolling() {
      var _this2 = this;

      this.pollingId = setInterval(function () {
        ping(config).then(function (online) {
          online ? _this2.goOnline() : _this2.goOffline();
        });
      }, config.interval);
    }
  }, {
    key: "stopPolling",
    value: function stopPolling() {
      clearInterval(this.pollingId);
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      window.addEventListener("online", this.goOnline);
      window.addEventListener("offline", this.goOffline);

      if (config.poll) {
        this.startPolling();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener("online", this.goOnline);
      window.removeEventListener("offline", this.goOffline);

      if (config.poll) {
        this.stopPolling();
      }
    }
  }]);

  return Base;
}(_react.Component);

var Online = exports.Online = function (_Base) {
  _inherits(Online, _Base);

  function Online() {
    _classCallCheck(this, Online);

    return _possibleConstructorReturn(this, (Online.__proto__ || Object.getPrototypeOf(Online)).apply(this, arguments));
  }

  _createClass(Online, [{
    key: "render",
    value: function render() {
      return this.state.online ? this.renderChildren() : null;
    }
  }]);

  return Online;
}(Base);

var Offline = exports.Offline = function (_Base2) {
  _inherits(Offline, _Base2);

  function Offline() {
    _classCallCheck(this, Offline);

    return _possibleConstructorReturn(this, (Offline.__proto__ || Object.getPrototypeOf(Offline)).apply(this, arguments));
  }

  _createClass(Offline, [{
    key: "render",
    value: function render() {
      return !this.state.online ? this.renderChildren() : null;
    }
  }]);

  return Offline;
}(Base);

var Detector = exports.Detector = function (_Base3) {
  _inherits(Detector, _Base3);

  function Detector() {
    _classCallCheck(this, Detector);

    return _possibleConstructorReturn(this, (Detector.__proto__ || Object.getPrototypeOf(Detector)).apply(this, arguments));
  }

  _createClass(Detector, [{
    key: "render",
    value: function render() {
      return this.props.render({ online: this.state.online });
    }
  }]);

  return Detector;
}(Base);
