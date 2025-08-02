import fetch from 'node-fetch';

/**
 * Username lookup across social platforms
 * Checks if username exists on various social media platforms
 * Uses HEAD requests to avoid rate limiting and improve performance
 */
export async function scanUsername(req, res) {
  const { username } = req.body;
  
  // Validate and sanitize username input
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Valid username is required' });
  }

  // Sanitize username - only allow alphanumeric, dots, underscores, hyphens
  const sanitizedUsername = username.replace(/[^a-zA-Z0-9._-]/g, '');
  if (sanitizedUsername.length < 2 || sanitizedUsername.length > 30) {
    return res.status(400).json({ error: 'Username must be 2-30 characters long' });
  }

  // Define social media platforms to check
  const platforms = {
    github: `https://github.com/${sanitizedUsername}`,
    twitter: `https://twitter.com/${sanitizedUsername}`,
    instagram: `https://instagram.com/${sanitizedUsername}`,
    linkedin: `https://linkedin.com/in/${sanitizedUsername}`,
    facebook: `https://facebook.com/${sanitizedUsername}`,
    reddit: `https://reddit.com/user/${sanitizedUsername}`,
    youtube: `https://youtube.com/@${sanitizedUsername}`,
    tiktok: `https://tiktok.com/@${sanitizedUsername}`
  };

  const results = {};

  // Check each platform for username existence
  for (const [platform, url] of Object.entries(platforms)) {
    try {
      const response = await fetch(url, {
        method: 'HEAD', // Use HEAD request for efficiency
        timeout: 5000, // 5 second timeout per platform
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SecurityWeb/1.0)'
        }
      });
      results[platform] = response.status === 200; // 200 means username exists
    } catch (error) {
      console.error(`Error scanning ${platform}:`, error.message);
      results[platform] = false; // Assume not found on error
    }
  }

  res.json({ username: sanitizedUsername, results });
}

/**
 * IP address information lookup
 * Retrieves geolocation and network information for an IP address
 * Uses ip-api.com service for comprehensive IP data
 */
export async function getIpInfo(req, res) {
  const { ip } = req.body;
  
  // Validate IP address input
  if (!ip || typeof ip !== 'string') {
    return res.status(400).json({ error: 'Valid IP address is required' });
  }

  // Basic IPv4 validation
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) {
    return res.status(400).json({ error: 'Invalid IP address format' });
  }

  try {
    // Fetch IP information from ip-api.com
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query`, {
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`IP API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if API request was successful
    if (data.status === 'fail') {
      return res.status(400).json({ error: data.message || 'Failed to get IP information' });
    }

    // Return formatted IP information
    res.json({
      ip: data.query,
      country: data.country,
      region: data.regionName,
      city: data.city,
      timezone: data.timezone,
      isp: data.isp,
      organization: data.org,
      coordinates: { lat: data.lat, lon: data.lon },
      isMobile: data.mobile,
      isProxy: data.proxy,
      isHosting: data.hosting,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('IP lookup error:', error);
    res.status(500).json({ 
      error: 'Failed to get IP information',
      details: error.message
    });
  }
}

/**
 * Domain information lookup
 * Retrieves DNS records and basic WHOIS information for a domain
 * Uses Google DNS and WHOIS XML API for domain analysis
 */
export async function getDomainInfo(req, res) {
  const { domain } = req.body;
  
  // Validate domain input
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Valid domain is required' });
  }

  // Basic domain format validation
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!domainRegex.test(domain)) {
    return res.status(400).json({ error: 'Invalid domain format' });
  }

  try {
    // Get DNS information using Google DNS
    const dnsResponse = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, {
      timeout: 10000
    });
    
    if (!dnsResponse.ok) {
      throw new Error(`DNS lookup failed: ${dnsResponse.statusText}`);
    }

    const dnsData = await dnsResponse.json();
    
    // Get WHOIS information (using demo API key)
    const whoisResponse = await fetch(`https://whois.whoisxmlapi.com/api/v1?apiKey=demo&domainName=${encodeURIComponent(domain)}`, {
      timeout: 10000
    });

    let whoisData = null;
    if (whoisResponse.ok) {
      whoisData = await whoisResponse.json();
    }

    // Return formatted domain information
    res.json({
      domain: domain.toLowerCase(),
      dns: {
        hasRecords: dnsData.Answer && dnsData.Answer.length > 0,
        ipAddresses: dnsData.Answer ? dnsData.Answer.map(record => record.data) : [],
        status: dnsData.Status
      },
      whois: whoisData ? {
        registrar: whoisData.registrar?.name,
        createdDate: whoisData.creationDate,
        expiryDate: whoisData.expiresDate,
        status: whoisData.status
      } : null,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Domain lookup error:', error);
    res.status(500).json({ 
      error: 'Failed to get domain information',
      details: error.message
    });
  }
}
