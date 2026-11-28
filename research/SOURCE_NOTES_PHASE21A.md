# Source notes — Phase 21A: global gridded datasets for the Earth weather atlas

Research date: 2026-11-28 (retrievals 13:50–14:06 UTC). Researcher: source/data sub-agent. Rules: /tmp/vv-research/p20/RULES.md.
User-Agent on every request: `VoyagerVentures-Research/0.1 (educational; respects robots.txt)`. At least 1.2 s between requests to the same host (4 s for the bulk PSL downloads after a 429).
All downloaded data is in `/tmp/vv-research/p21/a/`. Processing scripts (mine, not downloaded) are in `/tmp/vv-research/p21/scripts/` (`dods.py`, `png.py`, `process.py`).

## 0. robots.txt and access log

| Host | robots.txt result | What it means for us | Action |
|---|---|---|---|
| neo.gsfc.nasa.gov | redirects to a science.nasa.gov HTML page | NEO no longer exists (see §1) | none possible |
| science.nasa.gov | 200: `User-agent: * Allow: /` | allowed | read the NEO decommission page and the EO Global Maps pages |
| psl.noaa.gov | 404 (no robots.txt) | no restrictions | used (THREDDS fileServer and OPeNDAP) |
| downloads.psl.noaa.gov | **403 Forbidden** on robots.txt | treated as blocked under the RULES 403 clause | **not used**. The same files were taken from psl.noaa.gov/thredds |
| data.giss.nasa.gov | 200. Contains `Disallow: /gistemp/tabledata_v4/` and `Disallow: /pub/` | **GLB.Ts+dSST.csv is disallowed** (the CSV is at `/gistemp/tabledata_v4/GLB.Ts+dSST.csv`, linked from `/gistemp/data_v4.html`). The gridded netCDF is under `/pub/`, which is also disallowed | read only /gistemp/ and /gistemp/data_v4.html. **No GISTEMP data downloaded.** Substituted NOAAGlobalTemp (§3) |
| www.ncei.noaa.gov | 200: `Disallow: /data*`, `/orders*`, some /access/crn paths | /access/monitoring/… and /products/… are allowed | used Climate at a Glance CSV and the NOAAGlobalTemp product page |
| coastwatch.pfeg.noaa.gov (ERDDAP) | 200: disallows `/*?`, `/*.csv*`, `/*.nc*`, `/*.png*` etc. | ERDDAP data access disallowed | not used |
| gibs.earthdata.nasa.gov | 404 (no robots.txt) | no restrictions. WMS capabilities say `<Fees>none` and `<AccessConstraints>none` | used (WMS GetMap PNG + colormap XML) |
| earthdata.nasa.gov | 200 (standard Drupal file) | n/a | not needed |
| www.naturalearthdata.com | 200: only `/wp-admin/` disallowed | allowed | read terms of use |
| naciscdn.org (Natural Earth download CDN) | **403 AccessDenied** on robots.txt | treated as blocked | **not used** |
| raw.githubusercontent.com | 404 (no robots.txt) | no restrictions | used for the official nvkelso/natural-earth-vector GeoJSON |
| api.crossref.org | 404 (no robots.txt) | no restrictions | DOI verification |
| psl.noaa.gov/cgi-bin/mddb2 (dataset-metadata JSON behind PSL pages) | — | my tool permission layer **denied** this call | not retried. Citations were taken from the netCDF global attributes (OPeNDAP .das) instead |

Rate limit: psl.noaa.gov returned **HTTP 429 Too Many Requests** on one large request (the CBO OLR daily year in one call), and an `icec` year download came back truncated. I slowed down (one month per request, 4 s gaps), and all later requests returned 200.

---

## 1. NASA Earth Observations (NEO): decommissioned, nothing downloadable

- URL https://neo.gsfc.nasa.gov/ now 301-redirects to https://science.nasa.gov/earth/nasa-earth-observations-neo/ (page "Page Last Updated: Sep 01, 2026").
- Verbatim: "The NEO website was decommissioned in September 2026." / "After over 20 years of continuous delivery of global NASA data imagery, NASA Earth Observations (NEO) said goodbye in September 2026."
- The page lists alternatives (verbatim names): "Earth Observatory Global Maps", "NASA Worldview", "NASA Giovanni", "NASA AppEEARS", and "For users of the NEO WMS, NASA's Global Imagery Browse Services (GIBS) provides several OGC service APIs for thousands of NASA data layers."
- I checked Earth Observatory Global Maps (https://science.nasa.gov/earth/earth-observatory/global-maps/, and the sea-surface-temperature page). They are animations and images only, with no numeric download links.
- Result: **there are no NEO dataset IDs, CSV URL pattern or 99999 fill convention to record.** The NEO CSV route no longer exists. Every NEO layer the brief asked for was replaced as described below: the numeric NOAA PSL grids where possible, and otherwise NASA GIBS imagery converted to numbers through its published colormaps.

### Replacement layers, year 2024, all 12 months

All derived CSVs are in `/tmp/vv-research/p21/a/grids/<layer>/<yyyy-mm>.csv`.
CSV format, written by me and NEO-like: the first row is `lat\lon,` followed by the longitude cell centres. Each later row is the latitude cell centre followed by values in physical units. **Fill value = 99999.** Row and column order follows the source grid; the header gives the exact coordinates.

| Atlas layer (NEO equivalent) | Replacement dataset | Data kind | Grid in CSV | Units | Source access |
|---|---|---|---|---|---|
| Sea surface temperature | NOAA OISST v2.1 monthly mean (0.25°) → my 4×4 block mean to 1° (needs ≥50% valid ocean cells) | observation-based analysis (satellite + in situ) | 180×360, lat −89.5…89.5, lon 0.5…359.5 | °C | PSL OPeNDAP |
| Sea ice | NOAA OISST v2.1 `icec` monthly (0.25°) → 1° block mean over ocean cells (ocean cells missing in the source are counted as 0 ice; land excluded using `lsmask.oisst.nc`) | observation-based analysis | 180×360 | fraction 0–1 (see quirk) | PSL OPeNDAP |
| Total rainfall (the brief named GPM IMERG; IMERG numeric data needs an Earthdata login) | GPCP v2.3 monthly | observation (satellite–gauge merged). 2024 is **interim** data | 72×144 (2.5°), lat −88.75…88.75, lon 1.25…358.75 | mm/day | PSL OPeNDAP |
| Outgoing longwave (CERES substitute) | CPC Blended OLR (CBO) 1° daily → my calendar-month mean (needs ≥80% of days valid) | observation (satellite) | 180×360, lat 89.5…−89.5, lon 0.5…359.5 | W m⁻² | PSL OPeNDAP |
| Land temperature (air, not skin) | CPC GHCN_CAMS v3.01 0.5° monthly → 2×2 block mean to 1°, converted K→°C (−273.15) | observation (station analysis), land only, no Antarctica | 180×360, lat 89.5…−89.5 | °C | PSL OPeNDAP |
| Land surface temperature, MODIS day | GIBS `MODIS_Terra_L3_Land_Surface_Temp_Monthly_Day`, colormap-inverted (§1b) | observation (satellite) | 180×360, lat 89.5…−89.5, lon −179.5…179.5 | K (bin midpoint) | GIBS WMS |
| Vegetation (NDVI) | GIBS `MODIS_Terra_L3_NDVI_Monthly`, colormap-inverted | observation (satellite) | 180×360 | NDVI (bin midpoint) | GIBS WMS |
| Snow cover | GIBS `MODIS_Terra_L3_Snow_Cover_Monthly_Average_Pct`, colormap-inverted | observation (satellite) | 180×360 | % | GIBS WMS |
| Aerosol optical depth | GIBS `MERRA2_Total_Aerosol_Optical_Thickness_550nm_Extinction_Monthly`, colormap-inverted | **reanalysis** (MERRA-2) | 180×360 | unitless (bin midpoint) | GIBS WMS |
| Albedo | GIBS `MERRA2_Surface_Albedo_Monthly`, colormap-inverted | **reanalysis** (MERRA-2) | 180×360 | unitless (bin midpoint) | GIBS WMS |
| Water vapour | NCEP/NCAR R1 `pr_wtr.eatm` monthly mean | **reanalysis** | 73×144 (2.5°), lat 90…−90, lon 0…357.5 | kg m⁻² (≡ mm) | PSL OPeNDAP |
| Cloud fraction | NCEP/NCAR R1 `tcdc.eatm` monthly mean | **reanalysis (model output)** | 94×192 T62 Gaussian, lat 88.542…−88.542, lon 0…358.125 | % | PSL OPeNDAP |
| Net radiation at TOA | NCEP/NCAR R1 `dswrf.ntat`, `uswrf.ntat`, `ulwrf.ntat` monthly means. The app would compute net = dswrf − uswrf − ulwrf (not precomputed) | **reanalysis (model output)** | 94×192 Gaussian | W m⁻² | PSL OPeNDAP |
| Topography | NCEP/NCAR R1 `hgt.sfc` (model orography) and `land` mask, static | **reanalysis model field** | 73×144 | m; mask 0/1 | PSL OPeNDAP |

#### 1a. PSL dataset details

Licence/terms, verbatim from https://psl.noaa.gov/data/gridded/data.ncep.reanalysis.derived.html under "USAGE & CITATION" (the same block appears on PSL gridded pages): "If you acquire data products from PSL, we ask that you acknowledge us in your use of the data. This may be done by including text such as data provided by the NOAA PSL, Boulder, Colorado, USA, from their website at https://psl.noaa.gov in any documents or publications using these data."

OPeNDAP URL pattern: `https://psl.noaa.gov/thredds/dodsC/Datasets/<path>.dods?<var>[t0:1:t1][y0:1:y1][x0:1:x1]` (binary). `.das`, `.dds` and `.ascii` work the same way. File-server pattern: `https://psl.noaa.gov/thredds/fileServer/Datasets/<path>`.
Missing value in every float file: `-9.96921E36`. In my CSVs it becomes 99999.

The `meta/*.das` copies hold the full attribute text. Raw binary responses are in `psl/dods/`.

1. **NOAA OISST v2.1 (monthly mean, from daily)**
   - Path `noaa.oisst.v2.highres/sst.mon.mean.nc` (and `icec.mon.mean.nc`, `lsmask.oisst.nc`). 2024 = time indices 508–519 (`days since 1800-01-01`: 81814…82149, checked).
   - Attributes: title "NOAA/NCEI 1/4 Degree Daily Optimum Interpolation Sea Surface Temperature (OISST) Analysis, Version 2.1"; institution "NOAA/National Centers for Environmental Information".
   - `sst`: long_name "Monthly Mean of Sea Surface Temperature", units "degC", valid_range −3.0, 45.0.
   - `icec`: long_name "Monthly Mean Sea Ice Concentration", **units "percent" but valid_range 0.0, 1.0 and actual_range 0.01, 1.0**. The values are fractions. Both are recorded here; treat the data as a fraction.
   - Comment attribute cites: Reynolds et al. 2007 (doi:10.1175/2007JCLI1824.1, Crossref-verified: J. Climate 20, 5473–5496), Banzon et al. 2016 (doi:10.5194/essd-8-165-2016, as given in the file; not Crossref-checked), and Huang et al. 2021 (doi:10.1175/JCLI-D-20-0166.1, Crossref-verified: J. Climate 34, 2923–2939).
   - Verbatim from the comment: "Satellite data: multi-satellite sensor (AVHRR+VIIRS) data. Ice data: NCEP Ice and GSFC Ice."
   - Land-sea mask: 1 = ocean (691,150 cells), 0 = land.
2. **GPCP v2.3 monthly**
   - Path `gpcp/precip.mon.mean.nc`, indices 540–551.
   - `precip`: long_name "Average Monthly Rate of Precipitation", units "mm/day".
   - Title "GPCP Version 2.3 Combined Precipitation Dataset (Final)". **However, data_comment reads "Interim data covers 2021/11 through latest."**, so the 2024 values are interim.
   - Citation attribute: Adler et al. 2003, J. Hydrometeor. 4(6), 1147–1167 (doi:10.1175/1525-7541(2003)004<1147:TVGPCP>2.0.CO;2, Crossref-verified). V2.3 paper: Adler et al. 2018, Atmosphere 9, 138 (doi:10.3390/atmos9040138, Crossref-verified).
3. **CPC Blended OLR (CBO), 1° daily**
   - Path `cpc_blended_olr-1deg/olr.cbo-1deg.day.mean.nc`, 2024 = indices 12053–12418 (366 days, checked: first 1963536 h = 2024-01-01, last 1972296 h = 2024-12-31).
   - Units "W m-2". Platform "Observation". Source "NOAA/CPC https://ftp.cpc.ncep.noaa.gov/precip/CBO_V1/1deg-DLY/".
   - **No journal citation is given in the file** (gap).
   - The NOAA Interpolated OLR (`interp_OLR/olr.mon.mean.nc`, Liebmann & Smith citation in file) ends 2022-12, so it was not used for 2024.
4. **CPC GHCN_CAMS land air temperature v3.01**
   - Path `ghcncams/air.mon.mean.nc`, indices 912–923. Units "degK".
   - History: "Antarctica temperature is no longer in the dataset".
   - Citation (not in the file): Fan & van den Dool 2008, JGR 113, doi:10.1029/2007JD008470 (Crossref-verified).
   - **Data-quality flag:** in every 2024 month, roughly 18 cells near 0.25–1.25°N, 286.75–288.25°E (southern Colombia) have monthly means of 51–57 °C (Jan max 57.05 °C at 1.25°N, 287.75°E). These values are unphysical but present in the source. Also, the file's `actual_range` attribute reads "-49.21874, 335.75", which is inconsistent with degK. **The app must clip or mask this hotspot.**
5. **NCEP/NCAR Reanalysis 1 monthly means for 2024**
   - Paths `ncep.reanalysis.derived/surface/pr_wtr.eatm.mon.mean.nc` and `other_gauss/{tcdc.eatm,dswrf.ntat,uswrf.ntat,ulwrf.ntat}.mon.mean.nc`, indices 912–923.
   - Static fields: `ncep.reanalysis/surface/hgt.sfc.nc` (`hgt`, m) and `land.nc`.
   - `pr_wtr` has small **negative values** (2024 min −2.32 kg m⁻²; file actual_range −3.97…70.85), a model artefact. Clip at 0.
   - `hgt.sfc` range −583…5659 m. This is spectral model orography, not real topography.
   - Platform "Model". dataset_title "NCEP-NCAR Reanalysis 1".

#### 1b. GIBS imagery converted to numbers

- WMS GetMap URL pattern (EPSG:4326, 1 pixel = 1°): `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=<LAYER>&STYLES=&SRS=EPSG:4326&BBOX=-180,-90,180,90&WIDTH=360&HEIGHT=180&FORMAT=image/png&TRANSPARENT=TRUE&TIME=2024-MM-01`
- Colormap URL: `https://gibs.earthdata.nasa.gov/colormaps/v1.3/<name>.xml`. Colormap names: `MODIS_Land_Surface_Temp`, `MODIS_L3_NDVI`, `MODIS_NDSI_Snow_Cover`, `MERRA2_Total_Aerosol_Optical_Thickness_550nm_Extinction_Monthly`, `MERRA2_Surface_Albedo_Monthly`. Each is saved as `gibs/<LAYER>/colormap.xml`, next to the 12 PNGs.
- Terms: the WMS GetCapabilities says `<Fees>none` and `<AccessConstraints>none`. Its title is "NASA Global Imagery Browse Services for EOSDIS WMS (EPSG:4326 / best)".
- Method: every opaque pixel in all 60 PNGs matched a colormap RGB exactly (0 unmatched pixels), so the server resampled with nearest-neighbour and no colour blending. I assigned each pixel the **midpoint of its colormap bin** in the colormap's `value` units.
- Precision limits (record in-app):
  - LST bins are 0.6 K wide (e.g. "[259.40,260.00)").
  - AOD bins are 0.005 wide, and the top bin is "[0.900,+INF)", so values ≥0.9 are stored as 0.9.
  - Albedo bins are 0.005 wide, with top bin "[0.800,+INF)".
  - NDVI bins are 0.005 wide. Colormap classes below 0.0001 (water, bare) are flagged transparent and come out as **fill**.
  - Snow % classes 1–100. Snow 0% is transparent, so **fill = 0% or no data (ambiguous)**.
- Layer time extents from capabilities:
  - LST day: 2000-03-01/2026-10-01/P1M
  - NDVI: …2025-03-01/P1M, 2025-05-01/2026-10-01/P1M
  - Snow: multiple gaps, but 2024 is complete
  - MERRA-2 layers: 1980-01-01/2026-10-01/P1M
- CERES EBAF layers in GIBS (e.g. `CERES_EBAF_TOA_Net_Flux_All_Sky_Monthly`) end **2018-10-01**, so they were not used for 2024.
- MERRA-2 reference: Gelaro et al. 2017, J. Climate 30, 5419–5454, doi:10.1175/JCLI-D-16-0758.1 (Crossref-verified).
- GIBS layer metadata (GetMetadata) only returned a directory index, so the underlying MODIS product IDs and collection versions are **not verified**.

#### Sanity checks on my derived grids (area-weighted means over valid cells)

| Layer | Jan 2024 | Jul 2024 | Notes |
|---|---|---|---|
| OISST SST | 18.80 °C | 18.79 °C | range −1.80…34.60 °C |
| GPCP | 2.755 mm/day | 2.754 mm/day | |
| CBO OLR | 237.2 W m⁻² | 244.0 W m⁻² | |
| R1 TOA dswrf | 353.1 W m⁻² | 331.0 W m⁻² | perihelion vs aphelion |
| R1 tcdc | 52.9 % | 51.9 % | |
| MERRA-2 AOD | 0.121 | 0.166 | |
| MODIS LST day | 279.4 K | 293.9 K | land only |

---

## 2. Pressure and wind: NCEP/NCAR Reanalysis 1 long-term monthly means 1991–2020 (label: "reanalysis")

Downloaded from psl.noaa.gov (not downloads.psl.noaa.gov, see §0). Retrieved 2026-11-28.

| File (original netCDF4/HDF5, saved in `psl/nc/`) | Bytes | Variable | Units | Grid |
|---|---|---|---|---|
| `surface/slp.mon.ltm.1991-2020.nc` | 552,234 | `slp`, long_name "Long Term Mean Sea Level Pressure" | "millibars" (= hPa) | 2.5°, 73 lat (90…−90) × 144 lon (0…357.5) |
| `surface_gauss/uwnd.10m.mon.ltm.1991-2020.nc` | 1,155,868 | `uwnd`, "Long Term Mean Monthly Mean of U-Wind", level_desc "10 m" | "m/s" | T62 Gaussian 94 × 192 (lat ±88.542, lon 0…358.125) |
| `surface_gauss/vwnd.10m.mon.ltm.1991-2020.nc` | 1,169,158 | `vwnd` 10 m | m/s | same |
| `pressure/uwnd.mon.ltm.1991-2020.nc` | 10,927,383 | `uwnd`, "Long Term Mean Monthly mean u wind", 17 levels; **250 hPa = level index 8** (levels: 1000, 925, 850, 700, 600, 500, 400, 300, 250, 200, …, 10) | m/s | 2.5° 73 × 144 |
| `pressure/vwnd.mon.ltm.1991-2020.nc` | 11,405,646 | `vwnd`, same structure | m/s | same |

- URL: `https://psl.noaa.gov/thredds/fileServer/Datasets/ncep.reanalysis.derived/<path>`.
- I have no netCDF4 reader, so I also fetched OPeNDAP ASCII (`psl/ascii/*.ascii`: slp, u/v 10 m, u/v at 250 hPa only). These were converted to `grids/ncep_r1_{slp_hPa,uwnd_10m_m_s,vwnd_10m_m_s,uwnd_250hPa_m_s,vwnd_250hPa_m_s}_ltm/ltm1991-2020-MM.csv`.
- Time attribute: `climo_period "1991/01/01 - 2020/12/31"`. Missing value −9.96921E36 (none present). slp actual_range 972.72723…1061.0768. 250 hPa u actual_range (all levels) −37.46…91.43 m/s.
- Global attribute (slp): description "Data is from NMC initialized reanalysis (4x/day). These are the 0.9950 sigma level values." platform "Model". history "Created 2021/07/26 by doMonthLTMNC4".
- Sanity: Jan 250 hPa u max 73.8 m/s (subtropical jet). Jan 10 m u range −9.9…9.4 m/s.
- Citation (DOI only, Crossref-verified): Kalnay, E., et al., 1996: The NCEP/NCAR 40-Year Reanalysis Project. Bull. Amer. Meteor. Soc., 77, 437–471. doi:10.1175/1520-0477(1996)077<0437:TNYRP>2.0.CO;2
- Acknowledgement text: see the PSL "USAGE & CITATION" quote in §1a.

---

## 3. GISTEMP v4 table: robots-blocked. Substitute: NOAAGlobalTemp via NCEI Climate at a Glance

- **GISTEMP (not downloaded).** https://data.giss.nasa.gov/robots.txt disallows `/gistemp/tabledata_v4/` (where `GLB.Ts+dSST.csv` lives) and `/pub/`. The allowed page https://data.giss.nasa.gov/gistemp/ (updated "Nov 13, 2026") gives these citation instructions verbatim:
  - "GISTEMP Team, 2026: GISS Surface Temperature Analysis (GISTEMP), version 4. NASA Goddard Institute for Space Studies. Dataset accessed 20YY-MM-DD at https://data.giss.nasa.gov/gistemp/."
  - "Lenssen, N., G.A. Schmidt, M. Hendrickson, P. Jacobs, M. Menne, and R. Ruedy, 2024: A GISTEMPv4 observational uncertainty ensemble. J. Geophys. Res. Atmos., 129, no. 17, e2023JD040179, doi:10.1029/2023JD040179." (Crossref-verified.)
  - Lenssen et al. 2019, "Improvements in the GISTEMP Uncertainty Model", JGR 124, 6307–6326, doi:10.1029/2018JD029522 (Crossref-verified).
  - Inputs, verbatim: "NOAA GHCN v4 (meteorological stations) and ERSST v5 (ocean areas)".
  - Version/date line and base period from the CSV header: **not obtained** (the file is blocked).
- **Substitute downloaded:** `noaaglobaltemp/cag_globe_annual.csv` (2,003 bytes) from https://www.ncei.noaa.gov/access/monitoring/climate-at-a-glance/global/time-series/globe/tavg/land_ocean/12/12/1850-2025/data.csv. Label: "observation-based analysis".
  - Header, verbatim: `# Title: "Global Land and Ocean January - December Average Temperature Departures"`, `# Units: Degrees Celsius`, `# Base Period: 1901-2000`. Years 1850–2025 (e.g. 2023 = 1.17, 2024 = 1.26, 2025 = 1.12).
  - The product page https://www.ncei.noaa.gov/products/land-based-station/noaa-global-temp says "Current Version: 6.1.0" and "Version 6.1.0 uses the current WMO climatological standard normals period 1991–2020 as the reference period for temperature anomalies." **Discrepancy:** the CAG CSV header says base period 1901–2000. Both are recorded here; the CSV is clearly re-baselined to the 20th-century mean.
  - Data citation, verbatim: "Huang, B., X. Yin, M. J. Menne, R. Vose, NOAA Global Surface Temperature Dataset (NOAAGlobalTemp), Version 6.1.0 [indicate subset used]. NOAA National Centers for Environmental Information. https://doi.org/10.25921/vvaa-wq11." This is a DataCite DOI and was not Crossref-checked.
  - Paper: Yin et al. 2024, "NOAAGlobalTemp Version 6: An AI-Based Global Surface Temperature Dataset", BAMS 105, E2184–E2193, doi:10.1175/BAMS-D-24-0012.1 (Crossref-verified).

---

## 4. Coastline / land: Natural Earth 110m (public domain)

- Official repo raw URLs (naciscdn.org was 403, so not used):
  - `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_coastline.geojson`: 139,907 bytes, 134 LineString features.
  - `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson`: 138,160 bytes, 127 features.
  - Saved in `/tmp/vv-research/p21/a/naturalearth/`, together with the repo's `LICENSE.md` and `README.md`.
- Repo `VERSION` file: "5.2.0-pre" (the master branch, i.e. a pre-release of v5.2.0).
- Licence, verbatim from LICENSE.md and https://www.naturalearthdata.com/about/terms-of-use/: "All versions of Natural Earth raster + vector map data found on this website are in the public domain. You may use the maps in any manner, including modifying the content and design, electronic dissemination, and offset printing." / "No permission is needed to use Natural Earth. Crediting the authors is unnecessary." Suggested credit: "Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com."
- A 1° land mask is also available as numbers: the OISST `lsmask` (0.25°, 1 = ocean) and the R1 `land` field (2.5°).

---

## NOT FOUND / gaps

1. **NEO is gone** (decommissioned Sept 2026). There are no NEO IDs, CSVs, URL pattern or 99999 convention.
2. **GISTEMP GLB.Ts+dSST.csv is blocked by robots.txt.** The version/date line and the base period from its header were not obtained. NOAAGlobalTemp was substituted.
3. **GPM IMERG monthly numeric data** needs an Earthdata login. GPCP v2.3 (2.5°, interim for 2024) was used instead. GIBS has `IMERG_Precipitation_Rate` imagery but no monthly layer was found.
4. **CERES EBAF numeric data** needs NASA ordering/login. GIBS CERES EBAF imagery ends 2018-10. For 2024, net radiation is reanalysis only (R1 TOA fluxes). OLR is observed (CBO).
5. **Observed cloud fraction and water vapour (MODIS) as monthly numbers** were not found. GIBS has only daily `MODIS_Terra_Cloud_Fraction_Day`, and no monthly MODIS water-vapour layer was found. The reanalysis tcdc and pr_wtr were used instead and are labelled model/reanalysis.
6. **Observed AOD and albedo for 2024** were not taken. MERRA-2 reanalysis layers were used. The MISR/MODIS monthly AOD alternatives were not evaluated.
7. **Real topography** (e.g. ETOPO) was not obtained, because NCEI `/data*` is disallowed. Only the 2.5° R1 model orography is available.
8. GIBS-derived layers are **quantized** (bin midpoints) and lose sub-zero NDVI and 0% snow (both become fill). The underlying MODIS collection and product IDs are not verified.
9. CBO OLR has no citation paper. PSL dataset-page JSON metadata was not retrieved (permission denied).
10. The NH snow-cover dataset at PSL (`snowcover/snowcover.mon.mean.nc`) ends 1995-09, so it was not used.
11. Author bios: not verified (none were needed).
