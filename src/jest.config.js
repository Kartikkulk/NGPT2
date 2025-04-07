module.exports = {
    transformIgnorePatterns: [
      "node_modules/(?!(react-markdown|vfile|unist|unified|bail|is-plain-obj|trough|remark|mdast|micromark|decode|character|property|space|comma|react-icons)/)"
    ],
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    }
  };
  