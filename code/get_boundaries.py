from SE import spatial
import geopandas as gp
import pandas as pd
import numpy as np
from shapely.geometry import shape, mapping


def _around(geom, p):
    '''round (snap) geometry'''
    geojson = mapping(geom)
    geojson['coordinates'] = np.round(np.array(geojson['coordinates']), p)
    return shape(geojson)


def get_store_nhds(area_type='neighborhood', precision=None):
    print(area_type)
    nhds = spatial.get_geo_nhds(area_type=area_type)
    nhds = gp.GeoDataFrame(nhds)
    nhds = nhds[pd.notnull(nhds['geometry'])]

    if precision is not None:
        nhds['geometry'] = nhds['geometry'].apply(lambda x: _around(x, precision))
    # nhds = nhds[~nhds.geometry.empty]
    with open('../data/geography/{}.geojson'.format(area_type), 'w') as f:
        f.write(nhds.to_json())

    with open('../nyc_nhds_map/data/{}.geojson'.format(area_type), 'w') as f:
        f.write(nhds.to_json())


def main():
    get_store_nhds(precision=4)
    get_store_nhds(area_type='borough')


if __name__ == '__main__':
    main()

