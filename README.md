# EvalGate service status

Independent public availability probes for `https://www.evalgate.com`, hosted
on [GitHub Pages](https://evalgate.github.io/status/). The report remains readable
when the EvalGate application is unavailable.

GitHub Actions requests the homepage, liveness and readiness endpoints every ten
minutes and after changes. The report records HTTP status, check time and the
deployment workflow that produced it. It retains no user data or credentials.

This is a point-in-time availability observation. It does not prove every
authenticated workflow, certify a release, provide an SLA or promise a response
time. An old or unavailable report displays **Unknown**. Scheduled workflows can
be delayed by GitHub; the site never treats a delayed probe as a current pass.
There is no retrospective uptime or incident-history claim.

```bash
node --test scripts/status.test.mjs
node scripts/probe.mjs
```

For product maturity use the
[feature inventory](https://www.evalgate.com/docs/platform/feature-status).
For an observed incident, contact [hello@evalgate.com](mailto:hello@evalgate.com).
