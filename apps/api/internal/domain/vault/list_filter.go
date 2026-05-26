package vault

import "time"

// UserListFilter drives paginated, filtered vault listing for a single user.
type UserListFilter struct {
	Page         int
	PerPage      int
	SortField    string
	SortOrder    string
	Status       string
	Currency     string
	MinBalance   *string
	CreatedAfter *time.Time
}
