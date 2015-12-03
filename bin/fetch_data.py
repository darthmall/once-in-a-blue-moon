#!/usr/bin/env python3

from argparse import ArgumentParser
from bs4 import BeautifulSoup
from os import path

import csv, re, sys, urllib.parse, urllib.request

HOST = 'http://tidesandcurrents.noaa.gov/moon_phases.shtml'
MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
PHASES = {
    'X1.gif': 'new',
    'X2.gif': 'first quarter',
    'X3.gif': 'full',
    'X4.gif': 'last quarter'
}
SEASONS = {
    'S1': 'spring',
    'S2': 'summer',
    'S3': 'fall',
    'S4': 'winter'
}


def get_phase(td):
    # NOAA represents moon phases with gifs, so we use a mapping from
    # the gifs used to the moon phases.
    img = td.find('img')
    if img:
        d, f = path.split(img.get('src'))
        return PHASES[f]

    # If there is no image tag, this must be some other astronomical
    # event, like a solstice or the moon in apogee
    return None


def get_date(year, cols):
    assert len(cols) is 3

    mon = MONTHS.index(cols[0].get_text().strip()) + 1
    day = int(cols[1].get_text().strip())
    time = cols[2].get_text().strip() + ':00Z'

    return '{}-{:02d}-{:02d}T{}'.format(year, mon, day, time)


def update_season(td, season):
    return SEASONS.get(td.get_text().strip(), season)


def fetch_data(start, end, verbose=False):
    assert args.start <= args.end, 'Start date comes after end date'

    data = []

    for year in range(args.start, args.end + 1, 1):
        # Every year begins in winter
        season = 'winter'

        for month in MONTHS:
            query = urllib.parse.urlencode({
                'year': year,
                'data_type': 'mon' + month
            })

            req = urllib.request.Request(HOST + '?' + query)

            if args.verbose:
                print('Fetching data for', month, year, file=sys.stderr, end='...')

            with urllib.request.urlopen(req) as response:
                soup = BeautifulSoup(response.read(), 'html.parser')

                # The HTML table containing the astronomical data
                table = soup.find('table', class_=re.compile('table'))

                for row in table.tbody.find_all('tr'):
                    cols = row.find_all('td')

                    # Try to read moon phase information
                    phase = get_phase(cols[0])
                    if phase:
                        data.append([phase, get_date(year, cols[1:]), season])
                    else:
                        # This row doesn't encode a phase, so we'll check
                        # to see if its an equinox/solstice and update the
                        # current season accordingly
                        season = update_season(cols[0], season)

                if args.verbose:
                    print('done', file=sys.stderr)

    return data

if __name__ == '__main__':
    parser = ArgumentParser(description='Fetch astronomical data from NOAA')

    parser.add_argument('-v', '--verbose', action='store_true',
        help='Print progress to stderr')

    parser.add_argument('start', metavar='START', type=int,
        help='First year to fetch data for')
    parser.add_argument('end', metavar='END', type=int,
        help='Last year to fetch data for')

    args = parser.parse_args()

    phases = fetch_data(args.start, args.end, args.verbose)

    # CSV is written to stdout
    cout = csv.writer(sys.stdout)
    cout.writerow(['phase', 'timestamp', 'season'])
    cout.writerows(phases)
