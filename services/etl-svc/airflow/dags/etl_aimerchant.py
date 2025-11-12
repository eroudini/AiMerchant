from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.bash import BashOperator

# Example Airflow DAG that runs hourly
with DAG(
    dag_id='etl_aimerchant_hourly',
    schedule_interval='@hourly',
    start_date=datetime(2025, 1, 1),
    catchup=False,
    max_active_runs=1,
    default_args={
        'retries': 2,
        'retry_delay': timedelta(minutes=5),
    },
    tags=['aimerchant', 'etl']
) as dag:

    etl_amazon = BashOperator(
        task_id='etl_amazon',
        bash_command='cd /opt/airflow/repo/services/etl-svc && npm ci && npm run etl.run -- amazon',
        env={
            'NODE_OPTIONS': '--max_old_space_size=512',
        }
    )

    etl_shopify = BashOperator(
        task_id='etl_shopify',
        bash_command='cd /opt/airflow/repo/services/etl-svc && npm ci && npm run etl.run -- shopify',
    )

    etl_amazon >> etl_shopify
