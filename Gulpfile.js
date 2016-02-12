'use strict';
/**
 * Gulpfile.js - for tasks I haven't moved over to plain npm yet...
 */
var gulp        = require('gulp');
var awspub      = require('gulp-awspublish');
var del         = require('del');
var execSync    = require('sync-exec');
var fs          = require('fs');
var moment      = require('moment');
var os          = require('os');
var pkg         = require('./package.json');
var awsOpts     = require('./aws.json');


gulp.task('dist', function() {
    console.log('Running dist task...');
    del.sync(['dist']);
    console.log('dist deleted!');
    fs.mkdirSync('dist');

    gulp.src('build/**/*')
        .pipe(gulp.dest('dist'));

    var ver = 'dist/version.txt';
    var now = moment();

    // get current git revision from git.
    // Requires 'git' command line!!
    var rev = 'Not Available';
    var branch = 'Not Available';
    try {
        rev = execSync('git rev-parse HEAD').stdout.trim();
        branch = execSync('git rev-parse --abbrev-ref HEAD').stdout.trim();
    }
    catch (err) {
        console.log('Error running "git rev-parse HEAD"');
        console.log('    ' + err.message);
    }

    fs.appendFileSync(ver, '\nSkillSync.io - WWW');
    fs.appendFileSync(ver, '\n===================');
    fs.appendFileSync(ver, '\nName: ' + pkg.name);
    fs.appendFileSync(ver, '\nURL: https://github.com/bowmanmc/www.skillsync.io');
    fs.appendFileSync(ver, '\nVersion: ' + pkg.version);
    fs.appendFileSync(ver, '\nGit Branch: ' + branch);
    fs.appendFileSync(ver, '\nGit Revision: ' + rev);
    fs.appendFileSync(ver, '\nBuild Time: ' + now.format('YYYY-MM-DD HH:mm:ss'));
    fs.appendFileSync(ver, '\nBuild Host: ' + os.hostname() + ' [' + os.platform() + ']');
    fs.appendFileSync(ver, '\n');
    fs.appendFileSync(ver, '\n');
});

gulp.task('publish', function() {
    console.log('Connecting to S3 with options: ' + JSON.stringify(awsOpts));
    var publisher = awspub.create(awsOpts);

    var headers = {
    };

    return gulp.src('dist/**/*')
        .pipe(publisher.publish(headers, {
            force: true
        }))
        .pipe(publisher.sync())
        .pipe(awspub.reporter());

});
/*
aws.json
--------
{
    "params": {
        "Bucket": "bucketname"
    },
    "accessKeyId": "ABCDEFG",
    "region": "us-east-1",
    "secretAccessKey": "9as+aasdflkjasflkjafdsljkafsdjlk"
}
*/
