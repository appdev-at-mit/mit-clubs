pipeline {
    agent any
    triggers {
        githubPush()
    }
    options {
        skipStagesAfterUnstable()
    }
    stages {
        stage('Build') {
            steps {
                sh './build.sh'
            }
        }
        stage('Automated Testing') {
            steps {
                echo 'No tests to run right now...'
            }
        }
        stage('Deploy') {
            steps {
                sh './deploy.sh'
            }
        }
        stage('Manual Testing') {
            steps {
                script {
                    input message: 'Please verify the deployment in the test environment and confirm to proceed to production.',
                          ok: 'Proceed to Production',
                          id: 'userCheck' // Optional ID for reference
                }
                echo 'User confirmed, proceeding to production deployment...'
            }
        }
        stage('Package for Production') {
            steps {
                sh './build-prod.sh'
            }
        }
    }
}
