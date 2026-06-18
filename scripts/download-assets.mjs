import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, extname } from "path";

const BASE_URL = "https://premiercs.com";
const OUT_DIR = join(process.cwd(), "public", "images");

// All unique image paths extracted from premiercs.com
const IMAGE_PATHS = [
  "/_next/static/media/macbook-mock.0u.q-f025el5l.png",
  "/_next/static/media/anim-frame.0o~45sx-5hdks.jpg",
  "/_next/static/media/forbes.143myjoy~v3gi.png",
  "/_next/static/media/capterra-best-value.00t5bxlg4iebb.png",
  "/_next/static/media/g2-most-likely-to-recommend.06wsbe5tqid1~.png",
  "/_next/static/media/software-advice-best-customer-support.0qcsy6t7.56ul.png",
  "/_next/static/media/top-business-software.0mj0jmue12xmw.png",
  "/_next/static/media/source-forge.0-in2vkzk1bqy.png",
  "/_next/static/media/getapp_user_reviews.0.6onhw6mkn12.png",
  "/_next/static/media/capterra-shortlist.0h02c~5yk~62z.png",
  "/_next/static/media/software-advice.0n-b2fwemv5ph.png",
  "/_next/static/media/trust-radius.000og973kr7rl.png",
  "/_next/static/media/slashdot-leader.0lo6pr72_za6r.png",
  "/_next/static/media/capterra-best-ease-of-use.0417~7~erd3lt.png",
  "/_next/static/media/g2-momentum-leader.0p~.3g6z6cocw.png",
  "/_next/static/media/broccolini.0m32ii~2pizv6.png",
  "/_next/static/media/burkentine.0trovwnxzugua.png",
  "/_next/static/media/CA.02ltz.hs0o2hz.png",
  "/_next/static/media/fortis.01g_7~1t21h5m.png",
  "/_next/static/media/guardian.07~-_-ocmivn0.png",
  "/_next/static/media/Pariseault.0bot5w01ssawn.png",
  "/_next/static/media/PEVCO.0.rneld_xpcd6.png",
  "/_next/static/media/Sampson.0z_9srx3._s0o.png",
  "/_next/static/media/boyd-homes.13fnlkmnwhd9h.png",
  "/_next/static/media/broadway-builders.0hqynx7_jeyv3.png",
  "/_next/static/media/fieldgate-construction.07j3d8fq0vm-n.png",
  "/_next/static/media/higley.0btpvhbl0l0ed.png",
  "/_next/static/media/lge-designbuild.0c1jdh~ksulm_.png",
  "/_next/static/media/one70group.0ob1512x367zu.png",
  "/_next/static/media/ovation.09ydbl6blbchj.png",
  "/_next/static/media/pyramid-builders.0hme2men1s2v4.png",
  "/_next/static/media/sordoni.0ss-yxp-hrckx.png",
  "/_next/static/media/src-constructions.0lgnq06x5t8e8.png",
  "/_next/static/media/streamline.0je~dik5hca6z.png",
  "/_next/static/media/summit.0xi9dz~65.erf.png",
  "/_next/static/media/vpac-construction-group.0omkpz56hdai..png",
  "/_next/static/media/executives.0kpitiiqb9fju.jpg",
  "/_next/static/media/project-managers.0rv.-lad4px3..jpg",
  "/_next/static/media/accountants.0.y4c_7e7cwed.jpg",
  "/_next/static/media/sinjen-logo.11.~uzxqp20qd.png",
  "/_next/static/media/jason-aliotta.008sr8txbb4.v.png",
  "/_next/static/media/pevco-logo.0b2r50nwlx8rg.png",
  "/_next/static/media/dan-valerino.05yozlb~jloov.png",
  "/_next/static/media/tms-logo.168ud6.u2yfpz.png",
  "/_next/static/media/andi-urban.0q7im524oc0ub.png",
  "/_next/static/media/caliber-logo.11fltlq.v-ezx.png",
  "/_next/static/media/erika-reynolds.0f237mri40621.png",
  "/_next/static/media/gtc-logo.133-rjl3xlij_.png",
  "/_next/static/media/brian-thevenot.0im0s7~sz_5fh.png",
  "/_next/static/media/fcb-logo.1171x2e.u_glu.png",
  "/_next/static/media/paula-fahrendorf.0ctzboiof8_ii.png",
  "/_next/static/media/max-construction-logo.0yr~a762hgps..png",
  "/_next/static/media/alex-szollosi.0fs1y-apj596n.png",
  "/_next/static/media/la-verendrye-logo.01uuipu8_-gec.png",
  "/_next/static/media/jason-druker.0dterh_j12z-4.png",
  "/_next/static/media/gillam-logo.12x7_1hjzxg4g.png",
  "/_next/static/media/aziz-allana.0-.qztlvcq-r2.png",
  "/_next/static/media/summit-logo.0j3zkkrqdms4v.png",
  "/_next/static/media/boris-krassovski.0gd.v.ae-houy.png",
  "/_next/static/media/earthtone-logo.026z9jr1m-0d~.png",
  "/_next/static/media/amber-mcarthy.0f6ipq~t-igd1.png",
  "/_next/static/media/streamline-logo.0g3ep-7gt3n1k.png",
  "/_next/static/media/vikki-mcclain.05sir5sm9qeq9.png",
  "/_next/static/media/inland-logo.02tz1robc424q.png",
  "/_next/static/media/stacy-hernandez.0b1plg03.uokc.png",
  "/_next/static/media/future-fitouts-logo.0140_1f-n96v_.png",
  "/_next/static/media/aaron-lowe.0dwmuxopwzw7w.png",
  "/_next/static/media/intent-built-logo.16f.5063u.ni4.png",
  "/_next/static/media/brian-wessels.0v_zy~ob-~u7n.png",
  "/_next/static/media/promont-logo.0us_7edd_262_.png",
  "/_next/static/media/tehila-bresler.12up2-f24o~31.png",
  "/_next/static/media/arsenal-logo.0w4w0.ww4ijzs.png",
  "/_next/static/media/eugene-bortoluzzi.12mt27_lm67eb.png",
  "/_next/static/media/leaf_6.0e57t_y7m_e0a.png",
  "/_next/static/media/operational-playbook.0mc36k22.jpg",
  "/_next/static/media/eric-engelke.0j7pis.b6g8ni.png",
  "/_next/static/media/mark-vega.0.ka8nrwblz3_.png",
  "/_next/static/media/michael-hart.0_wbr--qlyjlm.png",
  "/_next/static/media/staff-1.0m7mgvqxi3bfr.jpg",
  "/_next/static/media/staff-2.0wj4e3-9sj2yh.jpg",
  "/_next/static/media/staff-3.0s7c5kdntmjch.jpg",
  "/_next/static/media/staff-4.0j8ka5w-dqj52.jpg",
  "/_next/static/media/staff-5.0o3p7i-fmb4lw.jpg",
  "/_next/static/media/cfma-logo.0-xm2v0hpb8el.png",
  "/_next/static/media/agc-logo.0y45mvt3pf0h1.png",
  "/_next/static/media/toronto-ca-logo.0pm5hfnbvuzfc.png",
  "/_next/static/media/acq-logo.0vwi5cln.rkj8.png",
  "/_next/static/media/batimatech-logo.0pf5dqgb.1vna.png",
  "/_next/static/media/cicpac-logo.0i8b4z.g16kno.png",
  "/_next/static/media/cube-lg.0fz2bc.2hg0p4.png",
  "/_next/static/media/cube-sm.07kjm2hq.png",
  "/_next/static/media/purple-3d-shape.0ne-~8gzb-1j.png",
  "/_next/static/media/footer-shape.0hqk-t37o97l.png",
];

function cleanName(path) {
  // Extract base name and strip Next.js hash suffix
  const base = path.split("/").pop() || path;
  const ext = extname(base);
  // Remove hash: everything from first dot-followed-by-alphanumeric-hash
  const nameNoHash = base.replace(/\.[a-z0-9~_]{6,}\.[a-z]{2,4}$/i, ext);
  // Also clean the name to be filesystem-safe
  return nameNoHash.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function downloadBatch(paths, batchSize = 4) {
  const mapping = {};
  const errors = [];
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (rawPath) => {
        const url = BASE_URL + rawPath; // use raw path as-is
        const localName = cleanName(rawPath);
        const outPath = join(OUT_DIR, localName);
        mapping[rawPath] = `/images/${localName}`;

        if (existsSync(outPath)) {
          console.log(`  [skip] ${localName}`);
          return;
        }
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buf = await res.arrayBuffer();
          writeFileSync(outPath, Buffer.from(buf));
          console.log(`  [ok]   ${localName} (${Math.round(buf.byteLength / 1024)}kb)`);
        } catch (err) {
          console.error(`  [err]  ${localName}: ${err.message} — ${url}`);
          errors.push({ rawPath, localName, error: err.message });
        }
      })
    );
  }
  return { mapping, errors };
}

ensureDir(OUT_DIR);
console.log(`Downloading ${IMAGE_PATHS.length} assets to public/images/...\n`);
const { mapping, errors } = await downloadBatch(IMAGE_PATHS);

const ok = IMAGE_PATHS.length - errors.length;
console.log(`\nDone: ${ok} ok, ${errors.length} errors`);
if (errors.length) {
  console.log("\nFailed:");
  errors.forEach((e) => console.log(`  ${e.localName}: ${e.error}`));
}
