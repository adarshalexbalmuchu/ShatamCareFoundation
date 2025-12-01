# Zoho Sites DNS Configuration for GitHub Pages

## Current Problem
Zoho Sites has default DNS records that conflict with GitHub Pages, preventing SSL certificate generation.

## Step-by-Step Fix for Zoho Sites

### Step 1: Access Zoho Sites DNS Management

1. **Login to Zoho Sites**: https://sites.zoho.com/
2. **Go to Domain Management**:
   - Navigate to your domain `shatamcare.org`
   - Look for "Domain Settings" or "DNS Management"
   - Alternative: Control Panel → Domain → DNS Records

### Step 2: Identify Conflicting Records

Look for and **DELETE** these types of records:
- Any A records pointing to Zoho IPs (not GitHub IPs)
- Any CNAME records for @ (apex domain)
- Any conflicting records that don't match GitHub Pages requirements

### Step 3: Configure Correct DNS Records

**Remove all existing A records for @ domain, then add:**

```
Record Type: A
Host/Name: @ (or leave blank for apex domain)
Value/Points to: 185.199.108.153
TTL: 3600 (or default)

Record Type: A
Host/Name: @ (or leave blank for apex domain)
Value/Points to: 185.199.109.153
TTL: 3600 (or default)

Record Type: A
Host/Name: @ (or leave blank for apex domain)
Value/Points to: 185.199.110.153
TTL: 3600 (or default)

Record Type: A
Host/Name: @ (or leave blank for apex domain)
Value/Points to: 185.199.111.153
TTL: 3600 (or default)
```

**Add WWW subdomain (recommended):**
```
Record Type: CNAME
Host/Name: www
Value/Points to: shatamcare.github.io
TTL: 3600 (or default)
```

### Step 4: Save and Wait

1. **Save all DNS changes** in Zoho Sites
2. **Wait 24-48 hours** for DNS propagation
3. **Don't make any changes to GitHub Pages** during this time

### Step 5: Update GitHub Pages (After DNS Propagation)

**Only after DNS has propagated (24-48 hours later):**

1. Go to: https://github.com/shatamcare/ShatamCareFoundation/settings/pages
2. **Remove** `shatamcare.org` from custom domain field
3. **Save changes**
4. **Wait 5 minutes**
5. **Add** `shatamcare.org` back to custom domain field
6. **Save changes**
7. **Enable "Enforce HTTPS"** checkbox (will appear when DNS is correct)

## Common Zoho Sites Issues

### Issue 1: Default Zoho DNS Records
Zoho Sites often adds default A records that point to their servers. These MUST be removed.

### Issue 2: Zoho Website Builder Conflicts
If you previously used Zoho Sites to build a website, there may be conflicting records.

### Issue 3: Email Records
Keep your MX records for email (if using Zoho Mail) but remove conflicting A/CNAME records.

## Verification Steps

### Check DNS Propagation
Visit: https://whatsmydns.net/#A/shatamcare.org

**You should see ONLY these IPs globally:**
- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

### Test Commands (After DNS Propagates)
```bash
# Check DNS resolution
host shatamcare.org

# Test HTTPS (should work after SSL is provisioned)
curl -I https://shatamcare.org
```

## Timeline Expectations

- **DNS changes in Zoho**: Immediate
- **DNS propagation**: 24-48 hours globally
- **GitHub SSL certificate**: 1-24 hours after DNS propagates
- **Total resolution time**: 2-3 days

## Troubleshooting

### If DNS Doesn't Propagate After 48 Hours:
1. Double-check you removed ALL conflicting A records in Zoho
2. Ensure you added all 4 GitHub A records correctly
3. Contact Zoho support if records aren't saving properly

### If SSL Still Fails After DNS is Correct:
1. Remove custom domain from GitHub Pages
2. Wait 24 hours
3. Re-add custom domain
4. Enable HTTPS enforcement

## Contact Information

- **Zoho Sites Support**: https://help.zoho.com/portal/en/community/topic/sites
- **GitHub Pages Docs**: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

---

**Next Action**: Log into Zoho Sites and update DNS records as shown above
