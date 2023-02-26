function initApp() {
  Zepto.getJSON("/api/", function (response) {
    const domains = shimData(response);
    const container = $("#container-providers");

    const providers = [
      { name: "腾讯云", website: "www.qcloud.com", size: "col-xl-6", icon: "/assets/img/qcloud.svg" },
      { name: "CloudFlare", website: "www.cloudflare.com", size: "col-xl-6", icon: "/assets/img/cloudflare.svg" },
      { name: "Namesilo", website: "www.namesilo.com", size: "col-xl-6", icon: "/assets/img/namesilo.svg" },
      { name: "阿里云", website: "www.aliyun.com", size: "col-xl-6", icon: "/assets/img/aliyun.svg" },
    ];

    container.empty();

    container.append(moduleTitle("Providers") + generateProviders(providers));
    container.append(moduleTitle("Stats") + generateStats(domains));

    container.append(moduleTitle("Pin Domains") + generateFavoriteCards(domains));
    container.append(moduleTitle("Domains"));
    generateMiniCard(domains, container);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initApp();
});

function shimData(data) {
  let result = [];

  Object.keys(data)
    .filter((n) => n != "favorite")
    .forEach((key) => {
      const dataset = data[key];
      const keyName = key.toLowerCase();
      if (!dataset) return
      for (const item of dataset) {
        const [domain, , expires] = item;
        if (data.favorite.includes(domain)) {
          result.push({ type: keyName, domain, expires, favorite: true });
        } else {
          result.push({ type: keyName, domain, expires });
        }
      }
    });

  const startTime = theBeginningOfThisYear();
  for (let i = 0; i < result.length; i++) {
    const { favorite, domain, type, expires } = result[i];
    const total = getTotalDays(expires, startTime);
    const past = getAliveDays(expires);
    const percentage = ((past / total) * 100).toFixed(2);
    const id = `${type}-${encodeURI(domain).replace(/[\W]/g, "-")}`;
    result[i] = { domain, type, expires, favorite, id, percentage, past, total };
  }

  return result;
}

function miniCardCircle(containerId, value) {
  let color = "";
  if (value >= 80) {
    color = "#5eba00";
  } else if (value >= 75 && value < 80) {
    color = "#206bc4";
  } else if (value >= 60 && value < 75) {
    color = "#fab005";
  } else {
    color = "#cd201f";
  }

  window.ApexCharts &&
    new ApexCharts(document.getElementById(containerId), {
      chart: {
        type: "radialBar",
        fontFamily: "inherit",
        height: 40,
        width: 40,
        animations: { enabled: false },
        sparkline: { enabled: true },
      },
      tooltip: { enabled: false },
      plotOptions: {
        radialBar: {
          hollow: { margin: 0, size: "75%" },
          track: { margin: 0 },
          dataLabels: { show: false },
        },
      },
      colors: [color],
      series: [value],
    }).render();
}

const moduleTitle = (title) => `<h3>${title}</h3>`;

const getTotalDays = (from, dest) => {
  const DAY = 1000 * 60 * 60 * 24;
  return Math.abs(((new Date(dest) - new Date(from)) / DAY).toFixed(2));
};
const getAliveDays = (from) => {
  const [dest] = new Date().toISOString().split("T");
  return getTotalDays(from, dest);
};
const theBeginningOfThisYear = () => {
  return `${new Date().getFullYear()}-01-01`;
};

const generateFavoriteCards = (domains) => {
  const favorites = domains.filter((data) => data.favorite);

  return favorites
    .map((data) => {
      const { domain, type, expires, id, percentage } = data;
      return `<div class="col-lg-6">
    <div class="card" id="${id}">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-3">
            <img src="assets/domains/${domain}.png" alt="${domain}" class="rounded" style="border: 1px solid #cdcdcd;">
          </div>
          <div class="col">
            <h3 class="card-title mb-1">
              <a href="#" class="text-reset">${domain} - ${type}</a>
            </h3>
            <div class="text-muted">
            Expires ${timeago.format(expires)} / ${expires}
            </div>
            <div class="mt-3">
              <div class="row g-2 align-items-center">
                <div class="col-auto">
                  ${percentage}%
                </div>
                <div class="col">
                  <div class="progress progress-sm">
                    <div class="progress-bar" style="width: ${percentage}%" role="progressbar" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
                      <span class="visually-hidden">${percentage}% Alive</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>`;
    })
    .join("");
};

const generateProviders = (data) => {
  return data
    .map((item) => {
      const { name, website, icon, size } = item;
      return `
<div class="col-md-6 ${size}">
<a class="card card-link" href="https://${website}" target="_blank">
  <div class="card-body">
    <div class="row">
      <div class="col-auto">
        <span class="avatar rounded" style="background-image: url(${icon});background-size: contain;"></span>
      </div>
      <div class="col">
        <div class="font-weight-medium">${name}</div>
        <div class="text-muted" style="text-transform: capitalize;">${website.replace("www.", "")}</div>
      </div>
    </div>
  </div>
</a>
</div>`;
    })
    .join("");
};

const generateMiniCard = (domains, container) => {
  const normal = domains.filter((data) => !data.favorite).sort((a, b) => a.expires.localeCompare(b.expires));

  let toBeDone = [];

  const template = normal
    .map((data) => {
      const { domain, type, expires, id, percentage } = data;
      toBeDone.push({ id, percentage });

      return `<div class="col-md-6 col-xl-3">
  <div class="card card-sm">
    <div class="card-body">
      <div class="row align-items-center">
        <div class="col-auto">
          <div class="chart-sparkline chart-sparkline-square" id="${id}"></div>
        </div>
        <div class="col">
          <div class="font-weight-medium mosaic">
            ${domain}
          </div>
          <div class="text-muted">
            ${percentage}% / ${expires}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
    })
    .join("");

  container.append(template);
  toBeDone.forEach((item) => miniCardCircle(item.id, item.percentage));
};

const generateStats = (domains) => {
  const domainCount = domains.length;
  const needRenew = domains.filter((domain) => domain.past <= 90).length;

  const warnTpl = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-alert-circle" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  const noWarnTpl = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-check" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M5 12l5 5l10 -10"></path></svg>`;
  const normalTpl = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trophy" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line><line x1="7" y1="4" x2="17" y2="4"></line><path d="M17 4v8a5 5 0 0 1 -10 0v-8"></path><circle cx="5" cy="9" r="2"></circle><circle cx="19" cy="9" r="2"></circle></svg>`;

  const miniCards = [
    { name: "Expires within three months", count: needRenew, type: 1 },
    { name: "Total Domains", count: domainCount, type: 2 },
  ]
    .map((data) => {
      const { name, count, type } = data;
      let icon = "";
      let bgColor = "";
      if (type === 1) {
        if (count) {
          icon = warnTpl;
          bgColor = "bg-reg";
        } else {
          icon = noWarnTpl;
          bgColor = "bg-green";
        }
      } else {
        icon = normalTpl;
        bgColor = "bg-blue";
      }
      return `
    <div class="col-md-6 col-xl-3">
      <div class="card card-sm">
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-auto">
              <span class="${bgColor} text-white avatar">${icon}</span>
            </div>
            <div class="col">
              <div class="font-weight-medium mosaic">
              ${count} Domains
              </div>
              <div class="text-muted">
                ${name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    })
    .join("");

  const stats = Object.entries(
    domains.reduce((prev, item) => {
      const { type } = item;
      if (prev[type]) {
        prev[type] += 1;
      } else {
        prev[type] = 1;
      }
      return prev;
    }, {})
  )
    .map((item) => {
      const [type, count] = item;
      let color = "";
      switch (type) {
        case "aliyun":
          color = "black";
          break;
        case "cloudflare":
          color = "orange";
          break;
        case "qcloud":
          color = "azure";
          break;
        case "namesilo":
          color = "blue";
          break;
      }
      const percentage = ((count / domainCount) * 100).toFixed(2);
      return { type, count, color, percentage };
    })
    .sort((a, b) => b.count - a.count);

  const summary = `<div class="col-md-12 col-xl-6">
  <div class="card">
    <div class="card-body">
      <div class="progress progress-separated mb-3" style="margin-bottom: 0.7rem !important;">
      ${stats.map((item) => `<div class="progress-bar bg-${item.color}" role="progressbar" style="width: ${item.percentage}%"></div>`).join("")}
      </div>
      <div class="row">
      ${stats
        .map((item) => `<div class="col-auto d-flex align-items-center pe-2"><span class="legend me-2 bg-${item.color}"></span><span class="mosaic">${item.type} (${item.count})</span></div>`)
        .join("")}
      </div>
    </div>
  </div>
</div>`;

  return miniCards + summary;
};
