  const blockedDomains = [ 
    "mailinator.com", 
    "tempmail.com", 
    "10minutemail.com", 
    "guerrillamail.com", 
    "yopmail.com", 
    "trashmail.com", 
    "fakeinbox.com", 
    "dispostable.com" 
  ]; 
  
  function isValidEmailFormat(email) { 
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 
    return regex.test(email); 
  } 
  
  function isDisposableEmail(email) { 
    const domain = email.split("@")[1]?.toLowerCase(); 
    return blockedDomains.includes(domain); 
  }

  module.exports = { isValidEmailFormat, isDisposableEmail };