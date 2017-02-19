start = E

E = _ left:T "+" right:E {
return {
    "name": "pipe",
    "left": left,
    "right": right
  };
}
/ T:T { return T; }

T = left:K "." right:T {
return {
    "name": "concat",
    "left": left,
    "right": right
  };
}
/ K:K { return K; }

K = J:J "*" {
  return {
  "name": "kleene",
   "expression": J
  };
}
/ J:J { return J; }

J = "(" E:E ")" { return E;  }
  / letter:letter { return letter; }

letter = l:[a-zA-Z0-9] { return { "name":"character", "value": l }; }

//optional whitespace
_  = [ \t\r\n]*
