server:
	python -m http.server 8000;

upload:
	aws s3 sync . s3://streeteasy-market-data-api/vis/maps/ --delete  --exclude '*.md' --exclude '*.DS_Store' --exclude '.git/*' 