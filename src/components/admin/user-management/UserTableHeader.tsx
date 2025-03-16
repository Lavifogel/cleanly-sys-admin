
const UserTableHeader = () => {
  return (
    <div className="grid grid-cols-7 p-4 font-medium bg-muted/40">
      <div>Phone Number</div>
      <div>Name</div>
      <div>Role</div>
      <div>Start Date</div>
      <div>Status</div>
      <div>Password</div>
      <div className="text-right">Actions</div>
    </div>
  );
};

export default UserTableHeader;
