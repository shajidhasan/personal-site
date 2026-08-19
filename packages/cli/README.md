# @sh4jid/cli

Share notes, pastes, and short links to your own site from the terminal.

This is the companion CLI for [sh4jid.me](https://sh4jid.me) and anything forked from
[its source](https://github.com/shajidhasan/personal-site), which serves markdown notes at
`/n/<alias>`, syntax-highlighted pastes at `/p/<alias>`, and short links at `/l/<alias>`.

```sh
npm i -g @sh4jid/cli
sh4 login
```

`sh4 login` prints a code and a URL. Open the URL in a browser where you are signed in to the
site's admin panel, confirm the code matches, and approve. The CLI then stores its own API key in
`~/.config/sh4/config.json` (mode `0600`). Each machine gets a separate key named after its
hostname, so you can revoke one without touching the others.

Point it at your own site with `sh4 login --base-url https://example.com`.

## Usage

```sh
sh4 note report.md -a q3            # → /n/q3            (alias: sh4 n)
cat notes.md | sh4 n                # reads stdin, random alias
sh4 paste main.ts                   # → /p/<random>      (alias: sh4 p)
sh4 link https://example.com -a ex  # → /l/ex            (alias: sh4 l)

sh4 ls n                            # tab-separated, pipeable
sh4                                 # interactive picker: copy, open, or delete
sh4 whoami                          # check the stored credential
sh4 logout                          # forget it
```

Every create prints the resulting URL and copies it to the clipboard. `-o` also opens it in a
browser, and `-f` overwrites an existing alias instead of failing on the conflict.

Note titles come from `-t`, else the first `# heading`, else the filename, else `Untitled`. Paste
languages come from the file extension unless you pass `-l`; an unrecognised one renders
unhighlighted rather than failing.

Markdown is rendered locally, using the same pipeline the site's admin editor uses, so content
created here is identical to content written in the browser.

## Requirements

Node 20 or newer, and a site running the matching server (a `/api/v1` endpoint plus better-auth's
device-authorization flow). On Linux, copying to the clipboard needs `xclip`, `xsel`, or
`wl-clipboard`; without one the URL is still printed.

## License

MIT
