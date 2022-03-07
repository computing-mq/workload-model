
rm -rf dist/* 
npm run production
scp -r dist/* mq92502288@remus.science.mq.edu.au:html/comp-allocation