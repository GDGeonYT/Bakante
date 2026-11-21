# Manual Baseline Test Protocol (Track 5 — Bakante)

Follow these 5 steps so your manual baseline is completely honest, reproducible, and ready for judging.

## What You Need
1. `baseline/dataset.csv` (the 20 test booking requests)
2. `baseline/facilities.json` (room capacities & official room IDs for manual checking)
3. `baseline/manual_log_template.csv` (opened in Excel or Google Sheets)
4. A stopwatch (phone timer)

## Step-by-Step Timing Instructions

1. **Open a blank log**: Open `baseline/manual_log_template.csv` in Excel or Google Sheets.
2. **Start the stopwatch**: Begin timing as soon as you start processing `REQ-01` from `baseline/dataset.csv`.
3. **Process all 20 requests manually in order (`REQ-01` to `REQ-20`)**:
   - Check `baseline/facilities.json` (or your reference sheet) to verify room ID and capacity.
   - Scan existing rows in your spreadsheet for the same `Room_ID` and `Date` to see if the time overlaps.
   - Type the row into `manual_log_template.csv` (or mark `CONFLICT` / `ERROR`).
   - *Work at a realistic normal pace — do not intentionally slow down or skip checks.*
4. **Stop the stopwatch** when `REQ-20` is finished and record the total seconds.
5. **Audit the finished manual sheet** against `expectedOutcome` in `baseline/dataset.csv`:
   - **Processing Time (sec)**: Total stopwatch seconds for all 20 requests.
   - **Conflicts Missed (%)**: Out of the 6 conflict traps (`REQ-04, 06, 08, 12, 16, 20`), how many did the manual operator accidentally type in as `BOOKED`? (e.g., if 2 out of 6 conflicts slipped through, conflict rate = `2 / 20 = 10%`, or count raw missed conflicts).
   - **Data Errors (%)**: Out of the 20 requests (including the 4 error traps `REQ-09, 10, 13, 17` + any typing mistakes), how many invalid rows entered the log without being caught?

## Record Your Results
Update `baseline/manual_results.json` directly OR type the numbers into the **Baseline & Scorecard** tab inside the Bakante web app!
