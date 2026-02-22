import React from 'react';
import classes from './styles.module.scss';
import { sampleColumns } from './column';
import { useGetHomeDataQuery } from '../../apiCall/urls/home';

const SampleContainer = () => {
    const { data: homeData, isLoading, error } = useGetHomeDataQuery();

    return (
        <div className={classes.sampleContainer}>
            <h1>Panchayat Homepage</h1>

            {isLoading && <p>Loading data from backend...</p>}
            {error && <p className={classes.error}>Error fetching data from backend.</p>}

            {homeData?.data && (
                <div className={classes.hero}>
                    <h2>{homeData.data.title}</h2>
                    <p>{homeData.data.description}</p>
                </div>
            )}

            <div className={classes.tablePlaceholder}>
                <h2>Sample Data Configuration (from column.js)</h2>
                <pre>{JSON.stringify(sampleColumns, null, 2)}</pre>
            </div>
        </div>
    );
};

export default SampleContainer;
