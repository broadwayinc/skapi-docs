# Referencing

Users can reference another record when uploading a new record.

When records are referenced, users can retrieve records based on the one being referenced.

This feature is useful for building a discussion board similar to Reddit, comment section, rating board, tracking purchased items, like buttons etc.

To reference a record, you'll need to specify the `record_id` or `unique_id` of the record you want to reference in the `reference` parameter in the `config` object.

## Uploading a Record to be Referenced

First lets upload a record to be referenced.

```js
let data = {
    post: "What do you think of this post?"
};

let config = {
    unique_id: 'unique id of the post',
    table: { name: 'Posts', access_group: 'public' }
};

let referenced_record_id;

skapi.postRecord(data, config).then(response => {
    // The original post has been uploaded. Now, users can upload another record that references it.
    referenced_record_id = response.record_id;  // Record ID of the record to be referenced.
});
```

## Creating a Referencing Record

Note that we have uploaded a record to be referenced,
we can use the uploaded record's ID in `reference` when uploading a comment record.

```js
let commentRecord = {
    comment: "I like it!"
};

let commentConfig = {
    table: { name: 'Comments', access_group: 'public' },
    reference: referenced_record_id
};

skapi.postRecord(commentRecord, commentConfig);
```

## Fetching References

Now you can query all the records that references the original record by passing the record ID in the `reference` parameter in [`getRecords()`](/api-reference/database/README.md#getrecords) method.:

```js
skapi.getRecords({
    table: { name: 'Comments', access_group: 'public' },
    reference: referenced_record_id,
}).then(response => {
    console.log(response.list);  // Array of comments of the reference record.
});
```

:::tip
A user cannot reference a record with a higher access group or 'private' access.
However, if the uploader has granted the private access of the record to the user, the user will be able to reference it.

A record that references another record can be uploaded in an access group above the user's own only when the user was granted private access to the referenced record, and only up to the referenced record's access group. A private referenced record lets no record above the user's own access group. See [Access Restrictions](/database/access-restrictions.md).
:::

:::danger
Users who have private access granted to a record will also have access to the private and higher access group records that reference it directly. This goes one level only: records that reference those records are not opened by it.
To avoid unintended sharing of private records, do not permit users to upload a private record that references another record.
:::

## Creating a Referencing Record with Unique ID

When uploading a record, you can also reference the record using the unique ID.

```js
skapi.postRecord({
    comment: "I like it!"
}, {
    table: { name: 'Comments', access_group: 'public' },
    reference: 'unique id of the post'
});
```


## Fetching References with Unique ID

If the reference record has a unique ID setup, you can also fetch records based on the unique ID of the record being referenced.

```js
skapi.getRecords({
    table: { name: 'Comments', access_group: 'public' },
    reference: 'unique id of the post'
}).then(response => {
    console.log(response.list);  // Array of records in 'Comments' table referencing the record with the unique ID.
});
```

More on unique ID can be found in [Unique ID](/database/unique-id.md).

## Fetching every record that references a record

A signed-in user can leave out `table` and fetch the records referencing a record in **every** table, in one request.

```js
skapi.getRecords({
    reference: 'record id or unique id of the post'
}).then(response => {
    console.log(response.list); // Records in any table that reference the post, that this user can read
});
```

Which records it returns depends on whether the user has **private access** to the record they name, the record being referenced:

**The rule:** the user who uploaded a record, and the users it was shared with, have every right to read the records that reference it.

| The user ... | The list holds |
|---|---|
| **uploaded** the referenced record, or it was **shared** with them with [`grantPrivateRecordAccess()`](/api-reference/database/README.md#grantprivateaccess) | **every** record that references it: access groups `0` to `99`, every private record and every subscription record, whatever the user's own access group. |
| anyone else | the referencing records in access groups `0` up to the user's own access group. **No** private records, not even the user's own, and subscription records only when the user uploaded them. |

This is the same rule as for any private record that references another record (see [Private Records](/database/access-restrictions.md#private-records)): private access to the referenced record opens the records attached to it, and being able to read it is not enough, so a public record opens none of them. To read your own private records that reference a record you have no private access to, name the table with `access_group: 'private'`.

Which calls need a `table` at all is in [What a query needs](/database/fetch.md#what-a-query-needs). To narrow it to one table, name the table with its access group, `table: { name: 'Comments', access_group: 1 }`, one call per group. Use this instead of calling [`getRecords()`](/api-reference/database/README.md#getrecords) once per table: one request replaces as many requests as the project has tables.

Signed-out users still need `table`. [`deleteRecords()`](/api-reference/database/README.md#deleterecords) is unchanged.


## Using reference to fetch certain user's post

You can also query all the records posted by certain user giving a `user_id` as a value of `reference` parameter.

```js
skapi.getRecords({
    table: { name: 'Comments', access_group: 'public' },
    reference: 'user-id-whose-post-you-want'
}).then(response => {
    console.log(response.list);  // Array of records in 'Comments' table posted by a certain user
});
```


## Removing a reference

To remove a reference, set the the `reference` parameter to `null` when updating the record.

```js
skapi.postRecord(undefined, {
    record_id: 'record_id_of_the_comment_to_remove',
    reference: null
}).then(record => {
    console.log(record);  // The reference has been removed.
});
```

## Letting the referenced record's owner modify referencing records

By default only the user who uploaded a record can change it. Set `source.can_modify_referencing_records` to `true` when you upload a record, and its uploader can also change the records that other users post referencing it.
This is useful for a discussion board where the post's author moderates the comments, a support thread where the author marks the answers, or a form whose author updates the status of each submission.

```js
// The post: its uploader may change the comments that reference it.
skapi.postRecord({
    post: "What do you think of this post?"
}, {
    table: { name: 'Posts', access_group: 'public' },
    source: {
        can_modify_referencing_records: true
    }
});
```

The post's uploader updates another user's comment with [`postRecord()`](/api-reference/database/README.md#postrecord) and the comment's `record_id`, as they would update their own record:

```js
skapi.postRecord({
    comment: "This comment was hidden by the author of the post."
}, {
    record_id: 'record_id_of_the_comment',
    tags: ['hidden'],
    index: { name: 'status', value: 'hidden' }
}).then(comment => {
    console.log(comment.user_id);    // Still the user who posted the comment.
    console.log(comment.updated_by); // The user ID of the post's uploader.
});
```

### What can be changed

The post's uploader can change only these on a record that references their post:

- `data`
- `tags`
- `index`. The post's [`referencing_index_restrictions`](#referencing-index-restrictions) still apply to the new index while the record references the post.
- `reference: null`, which unlinks the record from the post:

```js
skapi.postRecord(undefined, {
    record_id: 'record_id_of_the_comment',
    reference: null
});
```

Once unlinked, the record no longer references the post, so the post's uploader can no longer change it.

Everything else is refused with `INVALID_REQUEST`, and nothing is written:

- The table name, the access group, the subscription settings, `readonly`, `unique_id`, any `source` setting, and removing every file with `remove_bin: null`. The message names the first field that differs: `The referenced record's user can only change the data, tags and index of a record that references theirs, or unlink it ({field} differs).` A value sent as it is already stored is not a change, so a request that resends the record's whole config is fine.
- Removing files by URL with `remove_bin`: `The binary should be owned by the user.` The files belong to the user who posted the record.
- Pointing the reference at any other record. Only `null` is allowed.
- A private record that references the post: `The referenced record's user cannot update a private record.`
- A read-only record: `Record is read only.`
- A record in an access group above the post uploader's own: `User has no access to this group.`

Files cannot be attached either. The record is saved first, then each file asks for an upload permit, and those permits are refused (`User has no access to update this record.`). So the `data`, `tags`, `index` or `reference` change is already saved, and the files are not attached: with 1 to 4 files `postRecord()` and [`uploadFiles()`](/api-reference/database/README.md#uploadfiles) reject with that error, and with 5 or more they resolve and report each file in `failed`. Do not send files when changing another user's record.

The record keeps its owner: `user_id` stays the user who posted it, its files stay theirs, and that user can still update or delete it in full.

### When it can be turned on

`can_modify_referencing_records` hands other users' records to the record's uploader, so the users who reference a record must be able to see it before they post. That is why the uploader can set it to `true` only when the record is **created**:

- On an update, the uploader can turn it off (`false`) at any time, but cannot turn it on. Turning it on for an existing record is refused with `"source.can_modify_referencing_records" can only be set when the record is created. Only the project owner and admins in access group 99 can turn it on for an existing record.`
- The project owner and admins in access group `99` can turn it on for an existing record. Admins in access groups `90` ~ `98` can change only the [subscription settings](/database/subscription.md#who-can-change-subscription-settings) of another user's record, so they cannot.

The setting is returned in `record.source.can_modify_referencing_records`.

### Who changed a record: `updated_by`

When a record was last updated by someone other than its uploader (the referenced record's owner through this setting, the project owner or an admin), the record has `updated_by`: the user ID of that user. It is removed when the record's uploader updates the record again. `updated_by` cannot be set by a request.

The record that [`postRecord()`](/api-reference/database/README.md#postrecord) returns to the post's uploader after such an update has an empty `ip`, or `0.0.0.0` for a record posted by a signed-out user: a record's IP address is returned only to its uploader, the project owner and admins in access group `99`.

## Reference source settings in [`postRecord()`](/api-reference/database/README.md#postrecord)

When uploading record via [`postRecord()`](/api-reference/database/README.md#postrecord), you can set restrictions on referencing from other records using additional parameters in `source`.

- `source.referencing_limit`: Allowed maximum number of times that other records can reference the uploading record.
  This is useful if you are building ticketing system where only a certain number of people purchase a ticket.
  If this parameter is set to `null`, the number of references is unlimited. The default value is `null`.
  Set `referencing_limit` to `0` to prevent others to reference the uploading record.

- `source.prevent_multiple_referencing`: If set to `true`, single user will be allowed to reference this record only once.
  This is useful for building a voting system where each users are allowed to vote only once.

- `source.can_remove_referencing_records`: If set to `true`, the owner of the record has an authority to remove the referencing records.
  When the owner removes the record, all the referenceing records will be removed.
  This can be useful when you want to build a discussion board where the owner can remove the comments.
  The default value is `false`.

- `source.can_modify_referencing_records`: If set to `true`, the owner of the record can change the `data`, `tags` and `index` of the records that reference it, or unlink them with `reference: null`.
  Only the uploader can set it, and only when the record is created; the project owner and admins in access group `99` can turn it on later. Anyone who can update the record can turn it off.
  The default value is `false`. See [Letting the referenced record's owner modify referencing records](#letting-the-referenced-record-s-owner-modify-referencing-records).

- `source.only_granted_can_reference`: When set to `true`, only the user who has granted private access to the record can reference this record.

- `source.referencing_index_restrictions`: You can set list of restrictions on the index values of the referencing record.
  This is useful when you want to restrict the referencing record to have certain index names and values.
  This only affects referencing records that has an index.


## Referencing Index Restrictions

You can set restrictions on the index values of the referencing record.
This is useful when you want to restrict the referencing record to have certain index values.
This only affects referencing records that has an index.

For example, you can set the index value range so the total rating value does not exceed a certain value.

Example below shows how you can build a review board where only **10** people are allowed to rate **1** to **5** and each user can only rate once.

It is important to set restrictions on index values for cases like rating systems where you want to prevent users from posting malicious data to mess up your index informations.

```js
let pollPost = skapi.postRecord({
    title: `How would you rate Stan Getz, João Gilberto's album "Getz/Gilberto"?`,
    description: "Only 10 people are allowed to vote"
}, {
    unique_id: 'Review board of GetzGilberto',
    table: { name: 'ReviewBoard', access_group: 'public' },
    source: {
        prevent_multiple_referencing: true,
        referencing_limit: 10,
        referencing_index_restrictions: [
            {
                name: 'Review.Album.GetzGilberto',
                value: 1,
                range: 5
            }
        ]
    }
})
```

As shown in the example above, the `referencing_index_restrictions` parameter is an array of objects that contains the following properties:

- `name`: The name of the index value. (required)
- `value`: The value of the index. (optional)
- `range`: The range of the index value. (optional)
- `condition`: The condition of the index value. (optional)

Validation rules for `source.referencing_index_restrictions` fields:

- `name`: 1..128 characters, cannot be empty, cannot start with `$`, and must not include control characters or sentinel `􏿿`.
- `value` (string): 0..256 characters (empty string allowed), blocks only control characters and sentinel `􏿿`.
- `range` (string): 0..256 characters (empty string allowed), blocks only control characters and sentinel `􏿿`.

You can set many index restrictions by adding more objects to the array.

When the index restriction is set, the referencing record must have the same index name with same typed value and within the specified range.

If all optional parameters not set, the referencing record must have the same index name.

If `value` is set, the referencing record must have the same index name with the same value.

If `range` is set, the referencing record must have the same index name with the value within the specified range.

If `condition` is set, the referencing record must have the same index name with the index value that satisfies the condition to the `value`.
For example, if you want your referencing record's index value to be less than **5**, you can set the parameter as shown below:

```js
let pollPost = skapi.postRecord({
    title: `How would you rate Stan Getz, João Gilberto's album "Getz/Gilberto"?`,
    description: "Only 10 people are allowed to vote"
}, {
    unique_id: 'Review board of GetzGilberto',
    table: { name: 'ReviewBoard', access_group: 'public' },
    source: {
        prevent_multiple_referencing: true,
        referencing_limit: 10,
        referencing_index_restrictions: [
            {
                name: 'Review.Album.GetzGilberto',
                value: 5,
                condition: '<'
            }
        ]
    }
})
```

`condition` can be one of the following: `=`, `!=`, `>`, `<`, `>=`, `<=`, `eq`, `ne`, `gt`, `gte`, `lt`, `lte`.

`condition` cannot be used with `range`.


## Creating a Poll with Restricted Referencing

Now people can post a review by referencing the **pollPost**:

```js
// Now only 10 people can post references for this record
skapi.postRecord({
    comment: "This rocks! I'd give 4.5 out of 5!"
}, {
    table: { name: 'ReviewBoard', access_group: 'public' },
    reference: 'Review board of GetzGilberto',
    index: {
        name: 'Review.Album.GetzGilberto',
        value: 4.5
    }
});
```

Note that the "Review.Album.GetzGilberto" `index` uses a `value` of type `number` so you can later retrieve the average rating and total sum of the values.


## Powerful Ways to Use Reference Records

1. Discussion board
   
   The owner of the reference record has all access to the referencing records.
   
   Meaning, the user who uploaded the source of the reference record can have authority to delete the referencing records owned by other users, have access to all access levels referencing records including private records.

   This is useful when you want to build a discussion board where the owner can remove the comments, let users post private comments to reference owner.

   With `source.can_modify_referencing_records`, the owner can also edit the comments' data, tags and index, or unlink them from the post. See [Letting the referenced record's owner modify referencing records](#letting-the-referenced-record-s-owner-modify-referencing-records).
   
2. Rating/voting system
   
   You can set restrictions on the number of times a record can be referenced, prevent multiple referencing for each users, and restrict the index values of the referencing record.

   While Skapi database works as schema-less in nature, you can use this characteristic to have more control over how your users can post data to your project.

3. Sharing private data between limited users
   
   Private referencing records are readable only by their uploaders and by the users with private access to the reference record: its uploader, and the users it is shared with. This holds whatever the reference record's access group, so a private record attached to a public one stays private.
