# INSTALL AND START THE APP
Include the given code in the **preview** key under the **script** object.
```
"preview": "vite build; vite preview --host"
```
```
npm install
npm run preview
```
After changing anything, run `npm run build` to build the latest codes for the production.

# HTTPS
The "Not secure" warning means the mkcert root CA isn't trusted by the browser. Run:
```
mkcert -install
```
This installs the local CA into your system and browser trust stores. Then regenerate the cert to also cover 192.168.0.210:

```
cd ~/DevTools
mkcert localhost 127.0.0.1 ::1 192.168.0.210
```
After that, restart the dev server. The browser should show the padlock without any warning.

**Notes**:
The certificate doesn't cover 192.168.0.210 — it only has localhost, 127.0.0.1, 0.0.0.0, and ::1. The browser rejects the WSS connection because the cert is invalid for that IP.

Regenerate the cert with `mkcert` to include 192.168.0.210:
```bash
  mkcert localhost 127.0.0.1 ::1 192.168.0.210
```
This will output new localhost+3.pem and localhost+3-key.pem files (same names as current). Move them to ~/DevTools/ replacing the old ones, then restart the dev server.

## FAVICON
Read https://medium.com/@leahcardoz/how-to-change-the-favicon-title-of-your-react-app-in-5-minutes-9163e023b8d2
