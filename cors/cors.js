/*
  Here's some documentation on XMLHttpRequest Level 1 and 2 as per the
  standard and as per implementation.

  XHR
  http://www.w3.org/TR/XMLHttpRequest/
  http://developer.apple.com/internet/webcontent/xmlhttpreq.html
  http://msdn.microsoft.com/en-us/library/ms535874%28VS.85%29.aspx

  XHR2
  http://www.w3.org/TR/XMLHttpRequest2/
  http://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
  http://msdn.microsoft.com/en-us/library/cc288060%28VS.85%29.aspx

  The important thing to note about CORS is that the web service
  implementing it must respond to both OPTIONS and whichever HTTP verbs
  you list in OPTIONS with the same Access-Control headers.

  Firefox 3.5 reports errors rather than data (even on success) if the
  web service responds with a non-2XX status code or the preflighted
  OPTIONS request and GET/POST/PUT/DELETE Access-Control-Allow- headers
  mismatch.
*/
module.exports = function (req, res) {
  var writeHead = res.writeHead;
  function writeCorsHead (code, headers) {
    // IE8 does not allow domains to be specified, just the *
    headers["Access-Control-Allow-Origin"] = "*";

    // Note: IE8 doesn't preflight OPTIONS.
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";

    // Note: IE8 doesn't respect this header, might as well set it to false
    headers["Access-Control-Allow-Credentials"] = false;

    // It seems that this is ignored.
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours

    // All headers you wish to allow for XHR2 requests should be listed here.
    // Chrome is more strict than Firefox in this regard
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";

    writeHead.call(res, code, headers);
  }
  res.writeHead = writeCorsHead;
}
