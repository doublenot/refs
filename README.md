> [!WARNING]  
> This package now has a new home: [https://www.npmjs.com/package/refmerge](https://www.npmjs.com/package/refmerge) [[https://github.com/doublenot/refmerge](https://github.com/doublenot/refmerge)] 

[![Build Status](https://travis-ci.org/doublenot/refs.svg?branch=master)](https://travis-ci.org/doublenot/refs)
[![Coverage Status](https://coveralls.io/repos/github/doublenot/refs/badge.svg?branch=master)](https://coveralls.io/github/doublenot/refs?branch=master)

# refs

Compile and merge YAML, JSON or INI config files together through file path references

### Install:

```bash
$ npm install -g refs
```

### Example: YAML

#### Template(s):
```yaml
AWSTemplateFormatVersion: '2010-09-09'

Resources:
  - $ref: ./relative/path/to/file.yaml
```
```yaml
RolePolicies:
  $ref: ./resources/role-policies.yaml
```
```yaml
Type: 'AWS::IAM::Policy'
Properties:
  PolicyName: custom-role
  Roles:
    - custom-role
  PolicyDocument:
    Version: '2012-10-17'
    Statement:
      -
        Sid: PassRole
        Effect: Allow
        Resource:
          -
            'Fn::Join':
              - ""
              -
                - 'arn:aws:iam::'
                -
                  Ref: 'AWS::AccountId'
                - ':role/*'
        Action:
          - 'iam:PassRole'
```

#### Code:
```javascript
'use strict';

const path = require('path');
const refs = require('refs');

const templateDir = `${__dirname}/../templates`;
const buildDir = `${__dirname}/../build`;
const inputTemplate = path.resolve(`${templateDir}/template.yaml`);
const outputFile = path.resolve(`${buildDir}/output-template.yaml`);

try {
  refs(inputTemplate, outputFile)
    .then((results) => {
      console.log(`\n  File written: ${results.outputFile}`);
    });
} catch (e) {
  console.error(e.message);
  console.error(e.stack);
}
```

#### Or cli:
```bash
$ refs -o ./build/output.yaml ./templates/main.yaml
```

#### Output:
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  - RolePolicies:
      Type: 'AWS::IAM::Policy'
      Properties:
        PolicyName: custom-role
        Roles:
          - custom-role
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Sid: PassRole
              Effect: Allow
              Resource:
                - 'Fn::Join':
                    - ''
                    - - 'arn:aws:iam::'
                      - Ref: 'AWS::AccountId'
                      - ':role/*'
              Action:
                - 'iam:PassRole'
```
