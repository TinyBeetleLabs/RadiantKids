# 🔒 Security Checklist - Quick Reference

Use this checklist before deployment and for regular security audits.

---

## Pre-Deployment Checklist

### ✅ Environment Configuration

- [ ] `.env.local` file created with all required variables
- [ ] `USE_MOCK_DATA=false` for production
- [ ] `PCO_CLIENT_ID` set with valid Planning Center credential
- [ ] `PCO_CLIENT_SECRET` set with valid Planning Center credential
- [ ] `.env.local` is in `.gitignore` (never committed to git)
- [ ] No credentials hardcoded in source files

### ✅ Security Verification

- [ ] Run `npm run security:check` - all checks pass
- [ ] Run `npm audit` - no high/critical vulnerabilities
- [ ] Review `SECURITY.md` documentation
- [ ] All dependencies up to date (`npm update`)

### ✅ Deployment Platform (Vercel/Other)

- [ ] Environment variables set in deployment platform
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Custom domain configured (if applicable)
- [ ] Production environment selected
- [ ] Preview deployments secured (if using)

### ✅ Testing

- [ ] Test in production environment before public use
- [ ] Verify security headers present (use browser DevTools)
- [ ] Confirm no data in localStorage/sessionStorage
- [ ] Test error handling (generic errors in production)
- [ ] Verify API credentials work correctly

---

## Runtime Security Checklist

### ✅ Data Protection

- [ ] No sensitive data cached in browser
- [ ] All API calls over HTTPS
- [ ] Medical notes display correctly but not stored locally
- [ ] Browser cache disabled for dashboard pages

### ✅ Access Control

- [ ] Dashboard accessible only to authorized staff
- [ ] Tablets/devices physically secured
- [ ] Screen auto-lock enabled on display devices
- [ ] Network restricted (church WiFi only, if possible)

### ✅ Monitoring

- [ ] Regular review of access patterns
- [ ] Monitor for unusual API activity
- [ ] Check Vercel deployment logs periodically
- [ ] Review error logs for security issues

---

## Monthly Security Tasks

### ✅ Credential Management

- [ ] Rotate Planning Center API credentials (every 90 days)
- [ ] Review Planning Center API permissions
- [ ] Verify 2FA enabled on Planning Center account
- [ ] Check for any unauthorized API applications

### ✅ Software Updates

- [ ] Update Next.js (`npm update next`)
- [ ] Update React (`npm update react react-dom`)
- [ ] Update all dependencies (`npm update`)
- [ ] Run security audit (`npm audit fix`)
- [ ] Review and update TailwindCSS if needed

### ✅ Configuration Review

- [ ] Review security headers (verify in browser)
- [ ] Check Content Security Policy effectiveness
- [ ] Verify HTTPS enforcement
- [ ] Review error logging (no sensitive data logged)

---

## Quarterly Security Tasks

### ✅ Comprehensive Audit

- [ ] Full security review of SECURITY.md
- [ ] Review all environment variables
- [ ] Check for any new security best practices
- [ ] Update security documentation if needed
- [ ] Review Planning Center API changes

### ✅ Testing & Validation

- [ ] Penetration testing (if budget allows)
- [ ] Security scan of deployed application
- [ ] Review user access patterns
- [ ] Test incident response procedures

### ✅ Compliance

- [ ] Review COPPA compliance
- [ ] Review GDPR compliance (if applicable)
- [ ] Update privacy documentation
- [ ] Staff security training/review

---

## Incident Response Checklist

### 🚨 If Credentials Compromised

1. [ ] **Immediately** revoke Planning Center API credentials
2. [ ] Generate new credentials in Planning Center
3. [ ] Update credentials in deployment platform
4. [ ] Verify unauthorized access didn't occur
5. [ ] Document incident with timestamp
6. [ ] Review how compromise occurred
7. [ ] Implement additional security measures
8. [ ] Notify relevant stakeholders

### 🚨 If Data Breach Suspected

1. [ ] **Immediately** take dashboard offline
2. [ ] Document suspected breach details
3. [ ] Review server/deployment logs
4. [ ] Contact Planning Center support
5. [ ] Follow organization's incident response plan
6. [ ] Preserve evidence for investigation
7. [ ] Notify affected parties (if required)
8. [ ] Implement corrective measures before restoration

---

## Device Security Checklist

### ✅ Tablet/Display Devices

- [ ] Device encryption enabled
- [ ] Strong passcode/PIN set
- [ ] Auto-lock after 5 minutes inactivity
- [ ] USB ports disabled/secured
- [ ] Only dashboard app accessible
- [ ] Device updates enabled
- [ ] Find My Device enabled
- [ ] Physical security (mounting, locks)

### ✅ Network Security

- [ ] Separate VLAN for check-in devices (recommended)
- [ ] WPA3 WiFi encryption
- [ ] Guest network isolated from check-in network
- [ ] Firewall rules restricting unnecessary access
- [ ] VPN for remote access (if needed)

---

## Quick Verification Commands

### Check Security Headers
```bash
curl -I https://your-domain.com
# Look for: X-Frame-Options, CSP, HSTS, etc.
```

### Run Security Verification
```bash
npm run security:check
```

### Audit Dependencies
```bash
npm audit --production
```

### Check for Sensitive Data in Code
```bash
grep -r "localStorage\|sessionStorage" pages/ components/
# Should return no results
```

### Verify .gitignore
```bash
git check-ignore .env.local
# Should show: .env.local
```

---

## Security Contacts

### Internal
- IT Department: ___________________
- Security Lead: ___________________
- Kids Ministry Lead: ___________________

### External
- Planning Center Support: https://support.planningcenter.com
- Deployment Platform: ___________________
- Security Consultant: ___________________

---

## Documentation References

- **Full Security Docs**: [SECURITY.md](./SECURITY.md)
- **Setup Guide**: [SETUP.md](./SETUP.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **README**: [README.md](./README.md)

---

## Notes

| Date | Action | By | Notes |
|------|--------|-----|-------|
| | | | |
| | | | |
| | | | |

---

**Last Updated**: ___________________  
**Next Review Date**: ___________________  
**Reviewed By**: ___________________

