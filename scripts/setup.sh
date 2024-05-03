#!/bin/bash

# TODO(?): Make a PowerShell version of this

# The idea for this comes from https://unix.stackexchange.com/a/196246
# I've modified it to remove hyphens as well
function to_pascal_case {
    echo $1 | perl -pe 's/(^|(_|-))./uc($&)/ge;s/_|-//g'
}

function space_split_pascal {
    echo $1 | perl -pe 's/(?<!^)([A-Z]+)/ $1/g'
}

if [[ $# -lt 1 ]]; then
    echo "Mini name is missing!"
    exit 2
fi
if [[ $# -gt 1 ]]; then
    echo "Should only specify one parameter!"
    exit 2
fi

name=$1

if [[ -d $name ]] | [[ -h $name ]]; then
    echo "A directory for this mini already exists!"
    exit 2
fi

node scripts/update-name.js "@minids/${name}"
pascal_case_name=$(to_pascal_case $name)
title=$(space_split_pascal ${pascal_case_name})

cd src
sed -i.bak "s/MainComponent/${pascal_case_name}/g" main.ts
sed -i.bak "s/wwt-minids-template/wwt-minids-$name/g" main.ts
rm -f main.ts.bak
mv MainComponent.vue ${pascal_case_name}.vue

cd ../public
sed -i.bak "s/minids-template/$name/g" index.html
sed -i.bak "s/MiniDS data story template/$pascal_case_name/g" index.html
sed -i.bak "s/MiniDS Template/$title/g" index.html
rm -f index.html.bak
